async function checkOne(tel, receiptNo) {
  const url = "https://w1.onlineticket.jp/guestauth/member/guestAuth";

  const params = new URLSearchParams();
  params.append("telnum", tel);
  params.append("receiptNo", receiptNo);
  params.append("op", "commitGuestAuth"); // JSから判明

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString()
  });

  const html = await res.text();

  // 当落結果を抽出（簡易版）
  let result = "結果を抽出できませんでした";
  if (html.includes("当選")) result = "当選";
  if (html.includes("落選")) result = "落選";

  return result;
}

document.getElementById("run").onclick = async () => {
  const tel = document.getElementById("tel").value.trim();
  const entries = document.getElementById("entries").value.trim().split("\n");

  let html = "<table><tr><th>受付番号</th><th>結果</th></tr>";

  for (const receiptNo of entries) {
    const r = await checkOne(tel, receiptNo.trim());
    html += `<tr><td>${receiptNo}</td><td>${r}</td></tr>`;
    await new Promise(res => setTimeout(res, 800)); // ブロック防止
  }

  html += "</table>";
  document.getElementById("result").innerHTML = html;
};

