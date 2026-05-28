import {describe, test, expect, vi, beforeEach} from 'vitest';
import {fetchCurrentTable, fetchRatesByDateRange, fetchLastRates, fetchRateOnDate} from './api';


// =========================================================================================
// fetchCurrentTable
// =========================================================================================

describe('fetchCurrentTable', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    test('successful request returns data', async () => {
        const mockData = [
            {
                table: 'A',
                no: '123/A/NBP/2026',
                effectiveDate: '2026-05-11',
                rates: [],
            },
        ];

        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockData,
        }));

        const result = await fetchCurrentTable('a');

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/a/?format=json')
        );

        expect(result).toEqual(mockData);
    });

    test('404 response returns null', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            status: 404,
        }));

        const result = await fetchCurrentTable('b');

        expect(result).toBeNull();
    });

    test('API error throws an exception', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            url: 'https://api.nbp.pl/test',
            text: async () => 'server error',
        }));

        await expect(fetchCurrentTable('a')).rejects.toThrow(
            'NBP API response'
        );
    });

    test.each(['a', 'b'] as const)(
        'uses correct table in URL (%s)',
        async (table) => {
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => [],
            });

            vi.stubGlobal('fetch', mockFetch);

            await fetchCurrentTable(table);

            const url = mockFetch.mock.calls[0][0];

            expect(url).toContain(`/${table}/?format=json`);
        }
    );

    test('returns null for non-existing table', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 404,
        });

        vi.stubGlobal('fetch', mockFetch);

        const result = await fetchCurrentTable('x' as any);

        expect(result).toBeNull();
    });

    test('returns API response without modification', async () => {
        const mockData = [
            {
                table: 'A',
                no: '123/A/NBP/2026',
                effectiveDate: '2026-05-11',
                rates: [],
            },
        ];

        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockData,
        }));

        const result = await fetchCurrentTable('a');

        expect(result).toEqual(mockData);
    });

    test('calls fetch exactly once', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => [],
        });

        vi.stubGlobal('fetch', mockFetch);

        await fetchCurrentTable('a');

        expect(mockFetch).toHaveBeenCalledTimes(1);
    });
});


// =========================================================================================
// fetchRatesByDateRange
// =========================================================================================

describe('fetchRatesByDateRange', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    test('calls correct endpoint and returns data', async () => {
        const mockData = {
            table: 'A',
            currency: 'US Dollar',
            code: 'USD',
            rates: [
                {
                    no: '123/A/NBP/2026',
                    effectiveDate: '2026-05-11',
                    mid: 4.2,
                },
            ],
        };

        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockData,
        }));

        const result = await fetchRatesByDateRange(
            'a',
            'USD',
            '2026-01-01',
            '2026-01-31'
        );

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/a/USD/2026-01-01/2026-01-31/')
        );

        expect(result).toEqual(mockData);
    });

    test('returns null for 404 response', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            status: 404,
        }));

        const result = await fetchRatesByDateRange(
            'b',
            'EUR',
            '2026-01-01',
            '2026-01-31'
        );

        expect(result).toBeNull();
    });

    test('throws error for API failure', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            url: 'https://api.nbp.pl',
            text: async () => 'server error',
        }));

        await expect(
            fetchRatesByDateRange('a', 'USD', '2026-01-01', '2026-01-31')
        ).rejects.toThrow('NBP API response');
    });

    test.each(['a', 'b'] as const)(
        'uses correct table in URL (%s)',
        async (table) => {
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({}),
            });

            vi.stubGlobal('fetch', mockFetch);

            await fetchRatesByDateRange(table, 'USD', '2026-01-01', '2026-01-31');

            const url = mockFetch.mock.calls[0][0];

            expect(url).toContain(`/${table}/`);
            expect(url).toContain('/rates/');
            expect(url).toContain('/USD/');
        }
    );

    test('returns null for non-existing table', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 404,
        });

        vi.stubGlobal('fetch', mockFetch);

        const result = await fetchRatesByDateRange(
            'a',
            'USD',
            '2026-01-01',
            '2026-01-31'
        );

        expect(result).toBeNull();
    });


    test('calls fetch exactly once', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({}),
        });

        vi.stubGlobal('fetch', mockFetch);

        await fetchRatesByDateRange('a', 'USD', '2026-01-01', '2026-01-31');

        expect(mockFetch).toHaveBeenCalledTimes(1);
    });

});

// =========================================================================================
// fetchLastRates
// =========================================================================================

describe('fetchLastRates', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    test('calls correct endpoint and returns data', async () => {
        const mockData = {
            table: 'A',
            currency: 'US Dollar',
            code: 'USD',
            rates: [
                {
                    no: '123/A/NBP/2026',
                    effectiveDate: '2026-05-11',
                    mid: 4.15,
                },
            ],
        };

        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockData,
        }));

        const result = await fetchLastRates('a', 'USD', 10);

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/a/USD/last/10/')
        );

        expect(result).toEqual(mockData);
    });

    test('returns null for 404 response', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            status: 404,
        }));

        const result = await fetchLastRates('b', 'EUR', 5);

        expect(result).toBeNull();
    });

    test('throws error on API failure', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            url: 'https://api.nbp.pl',
            text: async () => 'server error',
        }));

        await expect(
            fetchLastRates('a', 'USD', 7)
        ).rejects.toThrow('NBP API response');
    });

    test.each(['a', 'b'] as const)(
        'uses correct table in URL (%s)',
        async (table) => {
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({}),
            });

            vi.stubGlobal('fetch', mockFetch);

            await fetchLastRates(table, 'USD', 10);

            const url = mockFetch.mock.calls[0][0];

            expect(url).toContain(`/rates/${table}/`);
            expect(url).toContain('/USD/');
            expect(url).toContain('/last/10/');
        }
    );

    test('returns null for non-existing table', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 404,
        });

        vi.stubGlobal('fetch', mockFetch);

        const result = await fetchLastRates('a', 'USD', 10);

        expect(result).toBeNull();
    });

    test('calls fetch exactly once', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({}),
        });

        vi.stubGlobal('fetch', mockFetch);

        await fetchLastRates('a', 'USD', 10);

        expect(mockFetch).toHaveBeenCalledTimes(1);
    });
});

// =========================================================================================
// fetchRateOnDate
// =========================================================================================

describe('fetchRateOnDate', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    test('calls correct endpoint and returns data', async () => {
        const mockData = {
            table: 'A',
            currency: 'US Dollar',
            code: 'USD',
            rates: [
                {
                    no: '123/A/NBP/2026',
                    effectiveDate: '2026-05-11',
                    mid: 4.18,
                },
            ],
        };

        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockData,
        }));

        const result = await fetchRateOnDate('a', 'USD', '2026-05-11');

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/a/USD/2026-05-11/')
        );

        expect(result).toEqual(mockData);
    });

    test('returns null for 404 response', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            status: 404,
        }));

        const result = await fetchRateOnDate('b', 'EUR', '2026-01-01');

        expect(result).toBeNull();
    });

    test('throws error on API failure', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            url: 'https://api.nbp.pl',
            text: async () => 'server error',
        }));

        await expect(
            fetchRateOnDate('a', 'USD', '2026-01-01')
        ).rejects.toThrow('NBP API response');
    });

    test.each(['a', 'b'] as const)(
        'uses correct table in URL (%s)',
        async (table) => {
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({}),
            });

            vi.stubGlobal('fetch', mockFetch);

            await fetchRateOnDate(table, 'USD', '2026-01-01');

            const url = mockFetch.mock.calls[0][0];

            expect(url).toContain(`/rates/${table}/`);
            expect(url).toContain('/USD/');
            expect(url).toContain('/2026-01-01/');
        }
    );

    test('returns null for non-existing table', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 404,
        });

        vi.stubGlobal('fetch', mockFetch);

        const result = await fetchRateOnDate('a', 'USD', '2026-01-01');

        expect(result).toBeNull();
    });


    test('does not contain undefined, double slashes or missing /last/', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({}),
        }));

        await fetchLastRates('a', 'USD', 10);

        const url = (fetch as unknown as vi.Mock).mock.calls[0][0];

        expect(url).not.toContain('undefined');
        expect(url.replace('https://', '')).not.toContain('//');
        expect(url).toContain('/last/');
    });

    test('calls fetch exactly once', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({}),
        });

        vi.stubGlobal('fetch', mockFetch);

        await fetchRateOnDate('a', 'USD', 10);

        expect(mockFetch).toHaveBeenCalledTimes(1);
    });

});
