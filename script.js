async function checkOne(tel, receiptNo) {
  const url = "https://w1.onlineticket.jp/guestauth/member/guestAuth";

  const params = new URLSearchParams();
  params.append("telnum", tel);
  params.append("receiptNo", receiptNo);
  params.append("op", "commitGuestAuth");

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });

  const html = await res.text();

  let result = "判定できません";
  if (html.includes("当選")) result = "当選";
  if (html.includes("落選")) result = "落選";

  // 当選した場合は詳細ページを取得
  let detail = null;
  if (result === "当選") {
    const detailUrlMatch = html.match(/href="([^"]*detail[^"]*)"/);
    if (detailUrlMatch) {
      const detailUrl = "https://w1.onlineticket.jp" + detailUrlMatch[1];
      const detailHtml = await fetch(detailUrl).then(r => r.text());
      detail = parseDetail(detailHtml);
    }
  }

  return { result, detail };
}

// 詳細ページから必要な情報だけ抽出
function parseDetail(html) {
  const datetime = html.match(/日時[^<]*<\/td><td[^>]*>([^<]+)/)?.[1] || "";
  const count = Number(html.match(/(\d+)枚/)?.[1] || 0);
  const price = Number((html.match(/([\d,]+)円/)?.[1] || "0").replace(/,/g, ""));
  const total = count * price;

  return { datetime, count, price, total };
}

document.getElementById("run").onclick = async () => {
  const tel = document.getElementById("tel").value.trim();
  const entries = document.getElementById("entries").value.trim().split("\n");

  let html = `
    <table class="result-table">
      <tr>
        <th>受付番号</th>
        <th>結果</th>
        <th>日時</th>
        <th>枚数</th>
        <th>単価</th>
        <th>合計</th>
      </tr>
  `;

  let totalSum = 0;

  for (const receiptNo of entries) {
    const { result, detail } = await checkOne(tel, receiptNo.trim());

    let rowColor = "";
    if (result === "当選") rowColor = "win";
    else if (result === "落選") rowColor = "lose";
    else rowColor = "unknown";

    html += `
      <tr class="${rowColor}">
        <td>${receiptNo}</td>
        <td>${result}</td>
        <td>${detail?.datetime || "-"}</td>
        <td>${detail?.count || "-"}</td>
        <td>${detail?.price ? detail.price + "円" : "-"}</td>
        <td>${detail?.total ? detail.total + "円" : "-"}</td>
      </tr>
    `;

    if (detail?.total) totalSum += detail.total;

    await new Promise(res => setTimeout(res, 800)); // ブロック防止
  }

  html += `</table>`;

  html += `<h3 class="total-sum">総額：${totalSum}円</h3>`;

  document.getElementById("result").innerHTML = html;
};

