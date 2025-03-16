// 전역 변수
let saleHistory = [];
let settlementHistory = [];
let characters = Array(6).fill().map(() => ({ name: '', gold: 0 }));
let investors = [
    { name: '투자자A', amount: 0 },
    { name: '투자자B', amount: 0 }
];

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 현재 날짜 설정
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('saleDate').value = today;
    document.getElementById('settlementDate').value = today;
    
    // 이벤트 리스너 등록
    document.getElementById('calculateInvestment').addEventListener('click', calculateInvestment);
    document.getElementById('addSale').addEventListener('click', addSaleRecord);
    document.getElementById('addSettlement').addEventListener('click', addSettlementRecord);
    document.getElementById('saveData').addEventListener('click', saveData);
    document.getElementById('loadData').addEventListener('click', loadData);
    document.getElementById('resetData').addEventListener('click', resetData);
    
    // 캐릭터 골드 입력 필드에 이벤트 리스너 등록
    for (let i = 1; i <= 6; i++) {
        document.getElementById(`character${i}Gold`).addEventListener('change', updateTotalGold);
        document.getElementById(`character${i}Name`).addEventListener('change', updateCharacterName);
    }
    
    // 저장된 데이터 로드 시도
    loadData();
});

// 투자자 정보 및 투자금 계산
function calculateInvestment() {
    // 투자자 이름 업데이트
    const investor1Name = document.getElementById('investor1Name').value || '투자자A';
    const investor2Name = document.getElementById('investor2Name').value || '투자자B';
    
    // 투자금액 가져오기
    const investor1Amount = parseFloat(document.getElementById('investor1Amount').value) || 0;
    const investor2Amount = parseFloat(document.getElementById('investor2Amount').value) || 0;
    
    // 투자자 정보 업데이트
    investors[0].name = investor1Name;
    investors[0].amount = investor1Amount;
    investors[1].name = investor2Name;
    investors[1].amount = investor2Amount;
    
    // 총 투자금 계산
    const totalInvestment = investor1Amount + investor2Amount;
    
    // 투자 비율 계산
    let investor1Ratio = 0;
    let investor2Ratio = 0;
    
    if (totalInvestment > 0) {
        investor1Ratio = (investor1Amount / totalInvestment) * 100;
        investor2Ratio = (investor2Amount / totalInvestment) * 100;
    } else {
        // 투자금이 없는 경우 50:50으로 설정
        investor1Ratio = 50;
        investor2Ratio = 50;
    }
    
    // 화면에 표시
    document.getElementById('investor1Ratio').textContent = 
        `${investor1Name}: ${investor1Amount.toLocaleString()} 원 (${investor1Ratio.toFixed(2)}%)`;
    document.getElementById('investor2Ratio').textContent = 
        `${investor2Name}: ${investor2Amount.toLocaleString()} 원 (${investor2Ratio.toFixed(2)}%)`;
    
    // 50:50 균형 조정 계산
    calculateBalanceAdjustment();
    
    // 전체 요약 업데이트
    updateSummary();
}

// 50:50 균형 조정 계산
function calculateBalanceAdjustment() {
    const investor1Amount = investors[0].amount;
    const investor2Amount = investors[1].amount;
    const totalInvestment = investor1Amount + investor2Amount;
    
    if (totalInvestment <= 0) {
        document.getElementById('adjustmentResult').textContent = "정산 필요 없음";
        return;
    }
    
    const halfInvestment = totalInvestment / 2;
    let adjustmentText = "";
    
    if (investor1Amount > halfInvestment) {
        // 투자자1이 투자자2에게 돈을 줘야 함
        const amountToGive = investor1Amount - halfInvestment;
        adjustmentText = `${investors[0].name}가 ${investors[1].name}에게 ${amountToGive.toLocaleString()} 원을 지불해야 50:50 비율이 됩니다.`;
    } else if (investor2Amount > halfInvestment) {
        // 투자자2가 투자자1에게 돈을 줘야 함
        const amountToGive = investor2Amount - halfInvestment;
        adjustmentText = `${investors[1].name}가 ${investors[0].name}에게 ${amountToGive.toLocaleString()} 원을 지불해야 50:50 비율이 됩니다.`;
    } else {
        adjustmentText = "정산이 필요하지 않습니다. 이미 50:50 비율입니다.";
    }
    
    document.getElementById('adjustmentResult').textContent = adjustmentText;
}

// 골드 판매 내역 추가
function addSaleRecord() {
    const saleDate = document.getElementById('saleDate').value;
    const goldAmount = parseFloat(document.getElementById('goldAmount').value) || 0;
    const saleAmount = parseFloat(document.getElementById('saleAmount').value) || 0;
    const memo = document.getElementById('saleMemo').value || '';
    
    if (goldAmount <= 0 || saleAmount <= 0) {
        alert('판매한 골드와 판매 금액은 0보다 커야 합니다.');
        return;
    }
    
    // 비율 계산 (골드 10당 가격)
    const ratio = (saleAmount / goldAmount) * 10;
    
    // 판매 내역에 추가
    saleHistory.push({
        date: saleDate,
        gold: goldAmount,
        amount: saleAmount,
        ratio: ratio,
        memo: memo
    });
    
    // 판매 내역 테이블 업데이트
    updateSaleHistoryTable();
    
    // 골드 판매 비율 업데이트
    updateGoldSaleRatio();
    
    // 전체 요약 업데이트
    updateSummary();
    
    // 입력 필드 초기화
    document.getElementById('goldAmount').value = '';
    document.getElementById('saleAmount').value = '';
    document.getElementById('saleMemo').value = '';
}

// 판매 내역 테이블 업데이트
function updateSaleHistoryTable() {
    const tableBody = document.getElementById('saleHistoryTable');
    tableBody.innerHTML = '';
    
    saleHistory.forEach((sale, index) => {
        const row = document.createElement('tr');
        
        // 날짜
        const dateCell = document.createElement('td');
        dateCell.textContent = formatDate(sale.date);
        row.appendChild(dateCell);
        
        // 골드 수량
        const goldCell = document.createElement('td');
        goldCell.textContent = sale.gold.toLocaleString() + ' 골드';
        row.appendChild(goldCell);
        
        // 현금 금액
        const amountCell = document.createElement('td');
        amountCell.textContent = sale.amount.toLocaleString() + ' 원';
        row.appendChild(amountCell);
        
        // 비율
        const ratioCell = document.createElement('td');
        ratioCell.textContent = sale.ratio.toLocaleString() + ' 원';
        row.appendChild(ratioCell);
        
        // 메모
        const memoCell = document.createElement('td');
        memoCell.textContent = sale.memo;
        row.appendChild(memoCell);
        
        tableBody.appendChild(row);
    });
}

// 골드 판매 비율 업데이트
function updateGoldSaleRatio() {
    if (saleHistory.length === 0) {
        document.getElementById('totalSoldGold').textContent = '0';
        document.getElementById('totalSoldAmount').textContent = '0';
        document.getElementById('averageRatio').textContent = '0';
        document.getElementById('latestRatio').textContent = '0';
        return;
    }
    
    const totalGold = saleHistory.reduce((sum, sale) => sum + sale.gold, 0);
    const totalAmount = saleHistory.reduce((sum, sale) => sum + sale.amount, 0);
    const averageRatio = (totalAmount / totalGold) * 10;
    const latestRatio = saleHistory[saleHistory.length - 1].ratio;
    
    document.getElementById('totalSoldGold').textContent = totalGold.toLocaleString();
    document.getElementById('totalSoldAmount').textContent = totalAmount.toLocaleString();
    document.getElementById('averageRatio').textContent = averageRatio.toLocaleString();
    document.getElementById('latestRatio').textContent = latestRatio.toLocaleString();
}

// 일일 정산 내역 추가
function addSettlementRecord() {
    const settlementDate = document.getElementById('settlementDate').value;
    const dailyIncome = parseFloat(document.getElementById('dailyIncome').value) || 0;
    const additionalInvestment = parseFloat(document.getElementById('additionalInvestment').value) || 0;
    const withdrawal = parseFloat(document.getElementById('withdrawal').value) || 0;
    const memo = document.getElementById('settlementMemo').value || '';
    
    // 정산 내역에 추가
    settlementHistory.push({
        date: settlementDate,
        income: dailyIncome,
        investment: additionalInvestment,
        withdrawal: withdrawal,
        memo: memo
    });
    
    // 정산 내역 테이블 업데이트
    updateSettlementHistoryTable();
    
    // 전체 요약 업데이트
    updateSummary();
    
    // 입력 필드 초기화
    document.getElementById('dailyIncome').value = '';
    document.getElementById('additionalInvestment').value = '';
    document.getElementById('withdrawal').value = '';
    document.getElementById('settlementMemo').value = '';
}

// 정산 내역 테이블 업데이트
function updateSettlementHistoryTable() {
    const tableBody = document.getElementById('settlementHistoryTable');
    tableBody.innerHTML = '';
    
    settlementHistory.forEach((settlement) => {
        const row = document.createElement('tr');
        
        // 날짜
        const dateCell = document.createElement('td');
        dateCell.textContent = formatDate(settlement.date);
        row.appendChild(dateCell);
        
        // 수익금
        const incomeCell = document.createElement('td');
        incomeCell.textContent = settlement.income.toLocaleString() + ' 원';
        row.appendChild(incomeCell);
        
        // 추가 투자
        const investmentCell = document.createElement('td');
        investmentCell.textContent = settlement.investment > 0 ? settlement.investment.toLocaleString() + ' 원' : '-';
        row.appendChild(investmentCell);
        
        // 지출
        const withdrawalCell = document.createElement('td');
        withdrawalCell.textContent = settlement.withdrawal > 0 ? settlement.withdrawal.toLocaleString() + ' 원' : '-';
        row.appendChild(withdrawalCell);
        
        // 메모
        const memoCell = document.createElement('td');
        memoCell.textContent = settlement.memo;
        row.appendChild(memoCell);
        
        tableBody.appendChild(row);
    });
}

// 캐릭터 이름 업데이트
function updateCharacterName(event) {
    const id = event.target.id;
    const index = parseInt(id.replace('character', '').replace('Name', '')) - 1;
    characters[index].name = event.target.value;
}

// 총 골드 업데이트
function updateTotalGold() {
    let totalGold = 0;
    
    for (let i = 1; i <= 6; i++) {
        const goldValue = parseFloat(document.getElementById(`character${i}Gold`).value) || 0;
        characters[i-1].gold = goldValue;
        totalGold += goldValue;
    }
    
    // 전체 요약 업데이트
    updateSummary();
}

// 전체 요약 업데이트
function updateSummary() {
    // 투자금 계산
    const totalInvestment = investors.reduce((sum, investor) => sum + investor.amount, 0);
    
    // 추가 투자금 계산
    const additionalInvestment = settlementHistory.reduce((sum, settlement) => sum + settlement.investment, 0);
    
    // 총 투자금
    const grandTotalInvestment = totalInvestment + additionalInvestment;
    
    // 총 수익금
    const totalIncome = settlementHistory.reduce((sum, settlement) => sum + settlement.income, 0);
    
    // 총 판매 금액
    const totalSaleAmount = saleHistory.reduce((sum, sale) => sum + sale.amount, 0);
    
    // 총 지출
    const totalWithdrawal = settlementHistory.reduce((sum, settlement) => sum + settlement.withdrawal, 0);
    
    // 순 수익
    const netIncome = totalIncome + totalSaleAmount - totalWithdrawal;
    
    // 총 현금 보유량
    const totalGoldHolding = characters.reduce((sum, character) => sum + character.gold, 0);
    
    // 화면에 표시
    document.getElementById('totalInvestment').textContent = grandTotalInvestment.toLocaleString();
    document.getElementById('totalIncome').textContent = (totalIncome + totalSaleAmount).toLocaleString();
    document.getElementById('totalWithdrawal').textContent = totalWithdrawal.toLocaleString();
    document.getElementById('netIncome').textContent = netIncome.toLocaleString();
    document.getElementById('totalGoldHolding').textContent = totalGoldHolding.toLocaleString();
    
    // 투자자별 요약 계산
    if (grandTotalInvestment > 0) {
        const investor1Share = (investors[0].amount / totalInvestment) * 100;
        const investor2Share = (investors[1].amount / totalInvestment) * 100;
        
        const investor1IncomeShare = netIncome * (investor1Share / 100);
        const investor2IncomeShare = netIncome * (investor2Share / 100);
        
        document.getElementById('investor1TotalInvestment').textContent = investors[0].amount.toLocaleString();
        document.getElementById('investor2TotalInvestment').textContent = investors[1].amount.toLocaleString();
        document.getElementById('investor1IncomeShare').textContent = investor1IncomeShare.toLocaleString();
        document.getElementById('investor2IncomeShare').textContent = investor2IncomeShare.toLocaleString();
    }
}

// 데이터 저장
function saveData() {
    const data = {
        investors: investors,
        characters: characters,
        saleHistory: saleHistory,
        settlementHistory: settlementHistory
    };
    
    // 로컬 스토리지에 저장
    localStorage.setItem('gameInvestmentData', JSON.stringify(data));
    
    // 파일로 다운로드
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game-investment-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('데이터가 저장되었습니다.');
}

// 데이터 불러오기
function loadData() {
    // 로컬 스토리지에서 불러오기
    const savedData = localStorage.getItem('gameInvestmentData');
    
    if (!savedData) {
        return; // 저장된 데이터가 없으면 종료
    }
    
    try {
        const data = JSON.parse(savedData);
        
        // 투자자 정보 불러오기
        if (data.investors) {
            investors = data.investors;
            document.getElementById('investor1Name').value = investors[0].name;
            document.getElementById('investor2Name').value = investors[1].name;
            document.getElementById('investor1Amount').value = investors[0].amount;
            document.getElementById('investor2Amount').value = investors[1].amount;
            
            // 투자 비율 계산
            calculateInvestment();
        }
        
        // 캐릭터 정보 불러오기
        if (data.characters) {
            characters = data.characters;
            for (let i = 0; i < 6; i++) {
                document.getElementById(`character${i+1}Name`).value = characters[i].name || '';
                document.getElementById(`character${i+1}Gold`).value = characters[i].gold || 0;
            }
        }
        
        // 판매 내역 불러오기
        if (data.saleHistory) {
            saleHistory = data.saleHistory;
            updateSaleHistoryTable();
            updateGoldSaleRatio();
        }
        
        // 정산 내역 불러오기
        if (data.settlementHistory) {
            settlementHistory = data.settlementHistory;
            updateSettlementHistoryTable();
        }
        
        // 전체 요약 업데이트
        updateSummary();
        
    } catch (error) {
        console.error('데이터 불러오기 오류:', error);
        alert('데이터 불러오기에 실패했습니다.');
    }
}

// 데이터 초기화
function resetData() {
    if (confirm('모든 데이터를 초기화하시겠습니까?')) {
        // 투자자 정보 초기화
        investors = [
            { name: '투자자A', amount: 0 },
            { name: '투자자B', amount: 0 }
        ];
        document.getElementById('investor1Name').value = '';
        document.getElementById('investor2Name').value = '';
        document.getElementById('investor1Amount').value = '';
        document.getElementById('investor2Amount').value = '';
        
        // 캐릭터 정보 초기화
        characters = Array(6).fill().map(() => ({ name: '', gold: 0 }));
        for (let i = 1; i <= 6; i++) {
            document.getElementById(`character${i}Name`).value = '';
            document.getElementById(`character${i}Gold`).value = '';
        }
        
        // 판매 내역 초기화
        saleHistory = [];
        updateSaleHistoryTable();
        updateGoldSaleRatio();
        
        // 정산 내역 초기화
        settlementHistory = [];
        updateSettlementHistoryTable();
        
        // 전체 요약 초기화
        updateSummary();
        
        // 로컬 스토리지 데이터 삭제
        localStorage.removeItem('gameInvestmentData');
        
        alert('모든 데이터가 초기화되었습니다.');
    }
}

// 날짜 포맷 함수
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}
