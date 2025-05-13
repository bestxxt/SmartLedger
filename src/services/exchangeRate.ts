import axios from 'axios';

const EXCHANGE_RATE_API_KEY = process.env.EXCHANGE_RATE_API_KEY;
const BASE_URL = 'https://v6.exchangerate-api.com/v6';

interface ExchangeRateResponse {
    result: string;
    base_code: string;
    target_code: string;
    conversion_rate: number;
    time_last_update_utc: string;
}

class ExchangeRateService {
    private static instance: ExchangeRateService;
    private cache: Map<string, { rate: number; timestamp: number }>;
    private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    private constructor() {
        this.cache = new Map();
    }

    public static getInstance(): ExchangeRateService {
        if (!ExchangeRateService.instance) {
            ExchangeRateService.instance = new ExchangeRateService();
        }
        return ExchangeRateService.instance;
    }

    /**
     * Convert amount from one currency to another
     * @param amount Amount to convert
     * @param fromCurrency Source currency code (e.g., 'USD')
     * @param toCurrency Target currency code (e.g., 'EUR')
     * @returns Converted amount
     */
    public async convertCurrency(
        amount: number,
        fromCurrency: string,
        toCurrency: string
    ): Promise<number> {
        if (fromCurrency === toCurrency) {
            return Number(amount.toFixed(2));
        }

        const rate = await this.getExchangeRate(fromCurrency, toCurrency);
        return Number((amount * rate).toFixed(2));
    }

    /**
     * Get exchange rate between two currencies
     * @param fromCurrency Source currency code
     * @param toCurrency Target currency code
     * @returns Exchange rate
     */
    private async getExchangeRate(
        fromCurrency: string,
        toCurrency: string
    ): Promise<number> {
        const cacheKey = `${fromCurrency}-${toCurrency}`;
        const cached = this.cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
            return cached.rate;
        }

        try {
            const response = await axios.get<ExchangeRateResponse>(
                `${BASE_URL}/${EXCHANGE_RATE_API_KEY}/pair/${fromCurrency}/${toCurrency}`
            );

            if (response.data.result !== 'success') {
                throw new Error('Failed to fetch exchange rate');
            }

            const rate = response.data.conversion_rate;
            if (!rate) {
                throw new Error(`Exchange rate not found for ${toCurrency}`);
            }

            this.cache.set(cacheKey, { rate, timestamp: Date.now() });
            return rate;
        } catch (error) {
            console.error('Error fetching exchange rate:', error);
            throw new Error('Failed to fetch exchange rate');
        }
    }

    /**
     * Clear the exchange rate cache
     */
    public clearCache(): void {
        this.cache.clear();
    }
}

export const exchangeRateService = ExchangeRateService.getInstance(); 