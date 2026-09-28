export class PayMongoService {
  private secretKey: string;

  constructor() {
    this.secretKey = process.env.PAYMONGO_SECRET_KEY || 'sk_test_placeholder';
  }

  /**
   * Creates a PayMongo Checkout Link
   * @param amount in PHP (e.g. 500)
   * @param description Transaction description
   * @param referenceNumber Internal reference number
   */
  async createCheckoutLink(params: { amount: number; description: string; referenceNumber: string }): Promise<string> {
    const amountInCentavos = Math.round(params.amount * 100);
    
    // For demo purposes if no real key is provided, we can simulate the PayMongo URL
    if (this.secretKey === 'sk_test_placeholder') {
      return `/payment-simulator?ref=${params.referenceNumber}&amount=${params.amount}`;
    }

    try {
      const auth = Buffer.from(`${this.secretKey}:`).toString('base64');
      const response = await fetch('https://api.paymongo.com/v1/links', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'authorization': `Basic ${auth}`
        },
        body: JSON.stringify({
          data: {
            attributes: {
              amount: amountInCentavos,
              description: params.description,
              remarks: params.referenceNumber
            }
          }
        })
      });

      const json = await response.json();

      if (!response.ok) {
        console.error('PayMongo Error:', json);
        throw new Error('Failed to create PayMongo checkout link');
      }

      // The checkout URL
      return json.data.attributes.checkout_url;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to initialize PayMongo checkout');
    }
  }
}

export const paymongoService = new PayMongoService();
