import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AttendanceNotificationRequest {
  type: 'late_arrival' | 'absent' | 'overtime_alert';
  employeeId?: string;
  date?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { type, employeeId, date } = await req.json() as AttendanceNotificationRequest;

    console.log(`Processing attendance notification: ${type}`);

    switch (type) {
      case 'late_arrival': {
        // Identify employees who clocked in late today
        const today = date || new Date().toISOString().split('T')[0];
        
        const { data: lateEmployees, error } = await supabaseClient
          .from('attendance')
          .select('*, profiles!inner(full_name, email)')
          .eq('date', today)
          .not('check_in', 'is', null);

        if (error) throw error;

        const nineAM = new Date(today);
        nineAM.setHours(9, 0, 0, 0);

        const lateArrivals = lateEmployees?.filter(emp => {
          const checkInTime = new Date(emp.check_in);
          return checkInTime > nineAM;
        }) || [];

        console.log(`Found ${lateArrivals.length} late arrivals`);

        // Create notifications for late arrivals
        for (const emp of lateArrivals) {
          await supabaseClient
            .from('notifications')
            .insert({
              user_id: emp.user_id,
              title: 'Late Arrival Notice',
              message: `You clocked in late today at ${new Date(emp.check_in).toLocaleTimeString()}`,
              type: 'warning',
            });
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            lateArrivals: lateArrivals.length,
            message: `Processed ${lateArrivals.length} late arrival notifications`
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'absent': {
        // Identify employees who haven't clocked in today
        const today = date || new Date().toISOString().split('T')[0];
        
        // Get all active employees
        const { data: employees } = await supabaseClient
          .from('profiles')
          .select('id, full_name, email')
          .eq('is_active', true);

        // Get today's attendance
        const { data: todayAttendance } = await supabaseClient
          .from('attendance')
          .select('user_id')
          .eq('date', today);

        const attendedIds = new Set(todayAttendance?.map(a => a.user_id) || []);
        const absentEmployees = employees?.filter(emp => !attendedIds.has(emp.id)) || [];

        console.log(`Found ${absentEmployees.length} absent employees`);

        // Create notifications for absent employees (optional - only if after certain time)
        const currentHour = new Date().getHours();
        if (currentHour >= 10) { // After 10 AM
          for (const emp of absentEmployees) {
            await supabaseClient
              .from('notifications')
              .insert({
                user_id: emp.id,
                title: 'Attendance Reminder',
                message: 'You have not clocked in today. Please update your attendance status.',
                type: 'info',
              });
          }
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            absentCount: absentEmployees.length,
            message: `Processed ${absentEmployees.length} absence notifications`
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'overtime_alert': {
        // Check for employees with excessive hours
        const today = date || new Date().toISOString().split('T')[0];
        
        const { data: todayAttendance, error } = await supabaseClient
          .from('attendance')
          .select('*, profiles!inner(full_name)')
          .eq('date', today)
          .not('check_in', 'is', null)
          .not('check_out', 'is', null);

        if (error) throw error;

        const overtimeThreshold = 9; // hours
        const overtimeEmployees = todayAttendance?.filter(record => {
          const checkIn = new Date(record.check_in);
          const checkOut = new Date(record.check_out);
          const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
          return hours >= overtimeThreshold;
        }) || [];

        console.log(`Found ${overtimeEmployees.length} employees with overtime`);

        // Create notifications
        for (const emp of overtimeEmployees) {
          const checkIn = new Date(emp.check_in);
          const checkOut = new Date(emp.check_out);
          const hours = ((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)).toFixed(1);

          await supabaseClient
            .from('notifications')
            .insert({
              user_id: emp.user_id,
              title: 'Overtime Logged',
              message: `You worked ${hours} hours today. Please ensure overtime is approved.`,
              type: 'info',
            });
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            overtimeCount: overtimeEmployees.length,
            message: `Processed ${overtimeEmployees.length} overtime alerts`
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid notification type' }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

  } catch (error: any) {
    console.error("Error in attendance-notifications function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
