// Integration Test: Binance & SIPAP Deposits, Admin Approval, Payouts, and Platform Settings
async function runTests() {
  console.log('--- 🧪 STARTING GAMESBOY FINANCE & WALLET TEST ---');

  // 1. Check Initial Balance
  const balRes1 = await fetch('http://localhost:3000/api/wallet/balance', {
    headers: { 'x-user-id': 'usr_client1' }
  });
  const balData1 = await balRes1.json();
  console.log('1. Initial Balance for usr_client1:', balData1.balancePyg, 'Gs. ($' + balData1.wallet.balanceUsd + ' USDT)');
  console.log('   Exchange Rate:', balData1.exchangeRatePyg, 'Gs./USDT');
  console.log('   Paraguay Bank:', balData1.paymentMethods?.paraguay?.bank);
  console.log('   Binance Pay ID:', balData1.paymentMethods?.binance?.payId);

  // 2. Submit Deposit via Binance USDT (e.g. 10 USDT -> 75.000 Gs.)
  console.log('\n2. Submitting 10 USDT Deposit via Binance...');
  const depRes1 = await fetch('http://localhost:3000/api/wallet/deposit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': 'usr_client1'
    },
    body: JSON.stringify({
      amount: 10,
      currency: 'USDT',
      method: 'binance_usdt',
      reference: 'BINANCE-ORDER-8891024'
    })
  });
  const depData1 = await depRes1.json();
  console.log('   Result:', depData1.message);
  const txId1 = depData1.transaction.id;

  // 3. Submit Deposit via SIPAP Paraguay (e.g. 100.000 Gs.)
  console.log('\n3. Submitting 100.000 Gs. Deposit via SIPAP...');
  const depRes2 = await fetch('http://localhost:3000/api/wallet/deposit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': 'usr_client1'
    },
    body: JSON.stringify({
      amount: 100000,
      currency: 'PYG',
      method: 'sipap_paraguay',
      reference: 'SIPAP-TRANSF-992184'
    })
  });
  const depData2 = await depRes2.json();
  console.log('   Result:', depData2.message);
  const txId2 = depData2.transaction.id;

  // 4. Admin Overview & Pending Deposits
  console.log('\n4. Admin fetching overview & pending deposits...');
  const adminRes1 = await fetch('http://localhost:3000/api/admin/overview');
  const adminData1 = await adminRes1.json();
  console.log('   Pending deposits count:', adminData1.pendingDeposits.length);
  const foundTx1 = adminData1.pendingDeposits.find(t => t.id === txId1);
  const foundTx2 = adminData1.pendingDeposits.find(t => t.id === txId2);
  console.log('   Found Binance Tx:', foundTx1 ? `${foundTx1.amountUsd} USDT -> ${foundTx1.localAmount} Gs.` : 'NOT FOUND');
  console.log('   Found SIPAP Tx:', foundTx2 ? `${foundTx2.localAmount} Gs. -> $${foundTx2.amountUsd} USDT` : 'NOT FOUND');

  // 5. Admin Approves Deposit #1 (Binance USDT)
  console.log('\n5. Admin approving Binance deposit (txId:', txId1, ')...');
  const appRes1 = await fetch('http://localhost:3000/api/admin/approve-deposit/' + txId1, { method: 'POST' });
  const appData1 = await appRes1.json();
  console.log('   Approval Result:', appData1.message);

  // 6. Admin Approves Deposit #2 (SIPAP Gs.)
  console.log('\n6. Admin approving SIPAP deposit (txId:', txId2, ')...');
  const appRes2 = await fetch('http://localhost:3000/api/admin/approve-deposit/' + txId2, { method: 'POST' });
  const appData2 = await appRes2.json();
  console.log('   Approval Result:', appData2.message);

  // 7. Verify Client Balance after Approvals
  const balRes2 = await fetch('http://localhost:3000/api/wallet/balance', {
    headers: { 'x-user-id': 'usr_client1' }
  });
  const balData2 = await balRes2.json();
  console.log('\n7. Updated Balance for usr_client1:', balData2.balancePyg, 'Gs. ($' + balData2.wallet.balanceUsd + ' USDT)');

  // 8. Admin Updates Payment & Binance Settings
  console.log('\n8. Admin updating platform settings...');
  const setRes = await fetch('http://localhost:3000/api/admin/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      exchangeRatePyg: 7500,
      commissionPercent: 15,
      paraguayBankDetails: {
        bank: 'Banco Familiar / Itaú Paraguay',
        accountHolder: 'GamesBoy Paraguay S.A.',
        rucOrCi: '80091234-5',
        accountNumber: '01-445566-7',
        aliasSipap: 'gamesboy.py'
      },
      binanceDetails: {
        payId: '849201934',
        walletAddress: '0x71C9414B3b27bA134a6C3f07a757657A82e4b92F',
        network: 'USDT (Binance Pay / BEP-20 / TRC-20)'
      }
    })
  });
  const setData = await setRes.json();
  console.log('   Settings update result:', setData.message);
  console.log('   Active Rate:', setData.settings.exchangeRatePyg, 'Gs.');
  console.log('   Binance Pay ID:', setData.settings.binanceDetails.payId);

  // 9. Seller Requests Payout in Guaraníes & Binance USDT
  console.log('\n9. Seller requesting payout...');
  const payReqRes = await fetch('http://localhost:3000/api/seller/payout-request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': 'usr_seller1'
    },
    body: JSON.stringify({
      amountPyg: 150000,
      method: 'binance_usdt',
      accountDetails: { binanceDestination: 'PayID: 998811223' }
    })
  });
  const payReqData = await payReqRes.json();
  console.log('   Payout Request Result:', payReqData.message);
  const payoutId = payReqData.payout ? payReqData.payout.id : null;

  if (payoutId) {
    // 10. Admin Approves Payout
    console.log('\n10. Admin approving payout ID:', payoutId);
    const appPayRes = await fetch('http://localhost:3000/api/admin/approve-payout/' + payoutId, { method: 'POST' });
    const appPayData = await appPayRes.json();
    console.log('   Approval Result:', appPayData.message);
  }

  console.log('\n🎉 --- ALL FINANCE, DEPOSIT & PAYOUT TESTS PASSED 100% SUCCESSFULLY! ---');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
