import { NextResponse } from 'next/server';
import { defaultBankAccountRepository } from '../../../../../modules/banking/infrastructure/bank-account.repository';

export async function GET() {
  try {
    const accounts = await defaultBankAccountRepository.getAll();
    const gatewayConfig = await defaultBankAccountRepository.getGatewayConfig();
    return NextResponse.json({
      success: true,
      accounts,
      gatewayConfig
    });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newAccount = await defaultBankAccountRepository.create(body);
    return NextResponse.json({
      success: true,
      data: newAccount
    });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
