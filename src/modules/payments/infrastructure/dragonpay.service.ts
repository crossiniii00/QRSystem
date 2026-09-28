import crypto from 'crypto';

export class DragonpayService {
  private readonly merchantId: string;
  private readonly password: string;
  private readonly baseUrl: string;

  constructor() {
    // In production, these should never have fallback values.
    // They are falling back to 'TEST_MERCHANT' / 'TEST_PASSWORD' temporarily since we don't have keys yet.
    this.merchantId = process.env.DRAGONPAY_MERCHANT_ID || 'TEST_MERCHANT';
    this.password = process.env.DRAGONPAY_PASSWORD || 'TEST_PASSWORD';
    
    const isProd = process.env.NODE_ENV === 'production';
    this.baseUrl = isProd 
      ? 'https://gw.dragonpay.ph/Pay.aspx' 
      : 'https://test.dragonpay.ph/Pay.aspx';
  }

  /**
   * Generates a secure Dragonpay Payment URL
   */
  public generatePaymentUrl(params: {
    txnid: string;
    amount: number;
    description: string;
    email: string;
  }): string {
    const amountStr = params.amount.toFixed(2);
    const ccy = 'PHP';
    
    // Dragonpay digest format: merchantid:txnid:amount:ccy:description:email:password
    const digestString = [
      this.merchantId,
      params.txnid,
      amountStr,
      ccy,
      params.description,
      params.email,
      this.password
    ].join(':');

    const digest = crypto.createHash('sha1').update(digestString).digest('hex');

    const url = new URL(this.baseUrl);
    url.searchParams.append('merchantid', this.merchantId);
    url.searchParams.append('txnid', params.txnid);
    url.searchParams.append('amount', amountStr);
    url.searchParams.append('ccy', ccy);
    url.searchParams.append('description', params.description);
    url.searchParams.append('email', params.email);
    url.searchParams.append('digest', digest);

    return url.toString();
  }

  /**
   * Validates a postback signature from Dragonpay
   */
  public validatePostback(params: {
    txnid: string;
    refno: string;
    status: string;
    message: string;
    digest: string;
  }): boolean {
    // Postback digest format: txnid:refno:status:message:password
    const digestString = [
      params.txnid,
      params.refno,
      params.status,
      params.message,
      this.password
    ].join(':');

    const expectedDigest = crypto.createHash('sha1').update(digestString).digest('hex');
    
    return expectedDigest === params.digest;
  }
}

export const dragonpayService = new DragonpayService();
