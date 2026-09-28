import { NextResponse } from 'next/server';
import { paymongoService } from '../../../../modules/payments/infrastructure/paymongo.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const txnid = 'TXN-' + Math.floor(Math.random() * 1000000000);
    const description = body.paymentType === 'APPLICATION_ASSESSMENT' ? 'Admissions Assessment Fee' : 'Matriculation Downpayment';
    
    // Generate real PayMongo Checkout URL
    const paymentUrl = await paymongoService.createCheckoutLink({
      amount: body.amount,
      description: description,
      referenceNumber: body.referenceNumber || txnid
    });

    return NextResponse.json({
      success: true,
      data: {
        id: txnid,
        gatewayRefNo: txnid,
        referenceNumber: body.referenceNumber,
        description,
        channel: body.channel,
        amount: body.amount,
        payerName: body.payerName,
        payerEmail: body.payerEmail,
        status: 'PENDING',
        paymentUrl,
        createdAt: new Date().toISOString()
      },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { message: "Failed to process payment" },
      meta: { timestamp: new Date().toISOString() }
    }, { status: 500 });
  }
}
