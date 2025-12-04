'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../crud-client/src/contexts/AuthContext';
import { settings } from '../../../crud-client/src/lib/settings';

export default function OrgForm({
                                    decoded,
                                    user,
                                    onSuccess,
                                }: {
    decoded: any;
    user: any;
    onSuccess: () => void;
}) {
    const { getToken } = useAuth();

    const [org, setOrg] = useState('');
    const [schemas, setSchemas] = useState<string[]>([]);
    const [available, setAvailable] = useState<boolean | null>(null);
    const [checking, setChecking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);

    // Fetch schema list once
    useEffect(() => {
        (async () => {
            try {
                const token = await getToken();
                const res = await fetch(`${settings.CRUD_SERVER_URL}/internal/schemas/list`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setSchemas(data);
                } else {
                    console.warn('[OrgForm] Schema list fetch failed:', res.status);
                }
            } catch (err) {
                console.warn('[OrgForm] Failed to fetch schema list:', err);
            }
        })();
    }, [getToken]);

    // Live availability check with debounce
    useEffect(() => {
        if (!org.trim()) {
            setAvailable(null);
            return;
        }

        setChecking(true);
        const delay = setTimeout(() => {
            const key = org.trim().toLowerCase();
            setAvailable(!schemas.includes(key));
            setChecking(false);
        }, 300);

        return () => clearTimeout(delay);
    }, [org, schemas]);

    // Shake animation helper
    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 400);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!available || checking) {
            triggerShake();
            setError('Please choose an available organization name.');
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const token = await getToken();
            const orgKey = org.trim().toLowerCase();

            const body = {
                schema: orgKey,
                sub: decoded?.sub || user?.sub,
                email: decoded?.email || user?.email,
                name: decoded?.name || user?.name,
                picture: decoded?.picture || user?.picture,
                memberships: [{ org_key: orgKey, roles: ['creator'] }],
                permissions: [],
            };

            const res = await fetch(`${settings.CRUD_SERVER_URL}/api/provision_user`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || `Provision failed (${res.status})`);
            }

            console.log('[OrgForm] ✅ Provision success');
            onSuccess();
        } catch (err: any) {
            console.error('[OrgForm] Error:', err);
            setError(err.message || 'Unexpected error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
            <form
                onSubmit={handleSubmit}
                className={`bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-md rounded-md p-6 w-full max-w-md transition-transform ${
                    shake ? 'animate-shake' : ''
                }`}
            >
                <h1 className="text-lg font-semibold mb-4">Create Your Organization</h1>

                <p className="text-sm text-gray-500 mb-4">
                    Welcome, <span className="font-medium">{decoded.email}</span>
                </p>

                <label className="block mb-2 text-sm font-medium">Organization Name</label>
                <input
                    type="text"
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    placeholder="e.g. acme"
                    className="w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Availability feedback */}
                <div className="min-h-[1.25rem] mt-1 text-xs">
                    {checking && (
                        <p className="text-gray-500 flex items-center gap-1">
                            <span className="animate-spin inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full"></span>
                            Checking availability…
                        </p>
                    )}
                    {!checking && available === false && (
                        <p className="text-red-500">This name is already taken.</p>
                    )}
                    {!checking && available === true && (
                        <p className="text-green-600">Name available!</p>
                    )}
                </div>

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                <button
                    type="submit"
                    disabled={loading || !org || available === false || checking}
                    className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                >
                    {loading && (
                        <span className="animate-spin inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                    )}
                    {loading ? 'Creating…' : 'Create'}
                </button>
            </form>

            {/* Shake animation keyframes */}
            <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          50% { transform: translateX(6px); }
          75% { transform: translateX(-4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
        </main>
    );
}
