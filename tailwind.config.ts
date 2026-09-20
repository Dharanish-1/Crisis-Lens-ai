import { NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export async function POST(req: Request) {
  try {
    const { phone, hazard, location, recommendation } = await req.json();

    const message = await client.messages.create({
      body: `🚨 EMERGENCY ALERT [CrisisLens AI]\nHazard: ${hazard}\nLocation: ${location}\nAction: ${recommendation}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    return NextResponse.json({ success: true, sid: message.sid });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
