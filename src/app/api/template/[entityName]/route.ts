// app/api/template/[entityName]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const CRUD_SERVER_URL =
    process.env.NEXT_PUBLIC_CRUD_SERVER_URL ||
    process.env.CRUD_SERVER_URL ||
    'https://localhost:8002';

export async function GET(
    req: NextRequest,
    context: { params: { entityName: string } }
) {
    const token = req.headers.get('authorization');
    if (!token) {
        return NextResponse.json(
            { error: 'Missing Authorization header' },
            { status: 401 }
        );
    }

    const { entityName } = context.params;

    const upstream = await fetch(
        `${CRUD_SERVER_URL}/template/${encodeURIComponent(entityName)}`,
        {
            method: 'GET',
            headers: {
                Authorization: token,
            },
        }
    );

    const body = await upstream.text();
    return new NextResponse(body, {
        status: upstream.status,
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function POST(
    req: NextRequest,
    context: { params: { entityName: string } }
) {
    const token = req.headers.get('authorization');
    if (!token) {
        return NextResponse.json(
            { error: 'Missing Authorization header' },
            { status: 401 }
        );
    }

    const { entityName } = context.params;

    let json: any;
    try {
        json = await req.json();
    } catch {
        return NextResponse.json(
            { error: 'Invalid JSON in request body' },
            { status: 400 }
        )
    }

    const upstream = await fetch(
        `${CRUD_SERVER_URL}/template/${encodeURIComponent(entityName)}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
            body: JSON.stringify(json),
        }
    );

    const body = await upstream.text();
    return new NextResponse(body, {
        status: upstream.status,
        headers: { 'Content-Type': 'application/json' },
    });
}
