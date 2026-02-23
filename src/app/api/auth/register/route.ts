import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { createAccessToken, decodeAccessToken } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { token, usn } = await request.json();
        if (!token) return NextResponse.json({ detail: "Token is required" }, { status: 400 });

        const payload = decodeAccessToken(token);
        if (!payload || payload.type !== 'register') {
            return NextResponse.json({ detail: "Invalid or expired token" }, { status: 400 });
        }

        const upperUsn = usn?.toUpperCase();
        const { rows } = await db.query('SELECT id FROM students WHERE usn = $1', [upperUsn]);
        if (rows.length > 0) {
            return NextResponse.json({ detail: "USN already registered" }, { status: 400 });
        }

        const insertRes = await db.query(
            'INSERT INTO students (name, email, google_sub, usn) VALUES ($1, $2, $3, $4) RETURNING id',
            [payload.name, payload.email, payload.sub, upperUsn]
        );

        const studentId = insertRes.rows[0].id;
        const accessToken = createAccessToken({ user_id: studentId, role: 'student' });

        return NextResponse.json({ access_token: accessToken, token_type: 'bearer' });
    } catch (err: any) {
        return NextResponse.json({ detail: err?.message || "Database error" }, { status: 500 });
    }
}
