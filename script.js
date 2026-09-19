const API_URL =
    "https://indonesia-stock-comparison.sayyid-syafiq136.workers.dev";

const TYPES = [
    "summary",
    "profile",
    "history",
    "dividends",
    "financial",
    "ownership"
];

let stockResults = [null, null];

/* =========================
   ELEMENT HELPERS
========================= */

function $(id) {
    return document.getElementById(id);
}

function setText(id, value) {
    const el = $(id);
    if (!el) return;

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        el.textContent = "Belum tersedia";
    } else {
        el.textContent = value;
    }
}

function setHTML(id, html) {
    const el = $(id);
    if (el) el.innerHTML = html;
}

/* =========================
   FORMATTERS
========================= */

function numberValue(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

function formatNumber(value) {
    const n = numberValue(value);

    if (n === null) {
        return "Belum tersedia";
    }

    return n.toLocaleString("id-ID");
}

function formatPrice(value) {
    const n = numberValue(value);

    if (n === null) {
        return "Belum tersedia";
    }

    return `Rp ${n.toLocaleString("id-ID")}`;
}

function formatPercent(value) {
    const n = numberValue(value);

    if (n === null) {
        return "Belum tersedia";
    }

    const sign = n > 0 ? "+" : "";

    return `${sign}${n.toFixed(2)}%`;
}

function formatDate(value) {
    if (!value) {
        return "Belum tersedia";
    }

    const date = new Date(
        value.includes("T")
            ? value
            : `${value}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}

function formatFileSize(bytes) {
    const n = numberValue(bytes);

    if (n === null || n === 0) {
        return "Ukuran tidak tersedia";
    }

    if (n < 1024) {
        return `${n} B`;
    }

    if (n < 1024 * 1024) {
        return `${(n / 1024).toFixed(1)} KB`;
    }

    return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function normalizeWebsite(url) {
    if (!url) return null;

    if (
        url.startsWith("http://") ||
        url.startsWith("https://")
    ) {
        return url;
    }

    return `https://${url}`;
}

/* =========================
   API
========================= */

async function fetchType(ticker, type) {
    const url =
        `${API_URL}/?symbol=${encodeURIComponent(ticker)}` +
        `&type=${encodeURIComponent(type)}`;

    const response = await fetch(url);

    if (!response.ok) {
        let message = `HTTP ${response.status}`;

        try {
            const errorData =
                await response.json();

            if (errorData?.detail) {
                message = errorData.detail;
            }
        } catch (_) {}

        throw new Error(message);
    }

    return response.json();
}


async function fetchStock(ticker) {

    const results =
        await Promise.all(
            TYPES.map(async (type) => {

                try {

                    const data =
                        await fetchType(
                            ticker,
                            type
                        );

                    return {
                        type,
                        ok: true,
                        data
                    };

                } catch (error) {

                    console.error(
                        `${ticker} ${type}:`,
                        error
                    );

                    return {
                        type,
                        ok: false,
                        error:
                            error.message ||
                            "Gagal mengambil data"
                    };
                }
            })
        );

    const output = {};

    results.forEach(result => {

        if (result.ok) {
            output[result.type] =
                result.data;
        } else {
            output[result.type] = null;
        }

    });

    return output;
}


/* =========================
   SUMMARY
========================= */

function renderSummary(stock, index) {

    if (!stock) return;

    const n = index + 1;

    setText(
        `name${n}`,
        stock.name
    );

    setText(
        `ticker${n}`,
        stock.symbol
            ? stock.symbol
            : "Belum tersedia"
    );

    setText(
        `price${n}`,
        formatPrice(stock.price)
    );

    setText(
        `change${n}`,
        stock.change !== null &&
        stock.change !== undefined
            ? `${stock.change > 0 ? "+" : ""}${formatNumber(stock.change)} (${formatPercent(stock.changePercent)})`
            : "Belum tersedia"
    );

    setText(
        `open${n}`,
        formatPrice(stock.open)
    );

    setText(
        `high${n}`,
        formatPrice(stock.high)
    );

    setText(
        `low${n}`,
        formatPrice(stock.low)
    );

    setText(
        `volume${n}`,
        formatNumber(stock.volume)
    );

    setText(
        `value${n}`,
        formatPrice(stock.value)
    );

    setText(
        `frequency${n}`,
        formatNumber(stock.frequency)
    );

    setText(
        `bid${n}`,
        formatPrice(stock.bid)
    );

    setText(
        `offer${n}`,
        formatPrice(stock.offer)
    );

    setText(
        `foreignBuy${n}`,
        formatNumber(stock.foreignBuy)
    );

    setText(
        `foreignSell${n}`,
        formatNumber(stock.foreignSell)
    );
}


/* =========================
   PROFILE
========================= */

function renderProfile(rawProfile, index) {

    if (!rawProfile) return;

    const n = index + 1;

    const profile =
        rawProfile?.data || {};

    const logo =
        profile.logo || "";

    const name =
        profile.name ||
        "Belum tersedia";

    const symbol =
        profile.code ||
        "";

    const sector =
        profile.sector;

    const industry =
        profile.industry ||
        profile.subIndustry;

    const website =
        profile.website;

    const business =
        profile.mainBusiness;

    setText(
        `profileName${n}`,
        name
    );

    setText(
        `profileTicker${n}`,
        symbol
            ? symbol
            : "Belum tersedia"
    );

    setText(
        `sector${n}`,
        sector
    );

    setText(
        `industry${n}`,
        industry
    );

    setText(
        `employees${n}`,
        "Belum tersedia"
    );

    const websiteElement =
        $(`website${n}`);

    if (websiteElement) {

        websiteElement.innerHTML = "";

        if (website) {

            const link =
                document.createElement("a");

            link.href =
                normalizeWebsite(website);

            link.target = "_blank";
            link.rel = "noopener noreferrer";

            link.textContent = website;

            websiteElement.appendChild(
                link
            );

        } else {

            websiteElement.textContent =
                "Belum tersedia";
        }
    }

    setText(
        `description${n}`,
        business
            ? business
            : "Belum tersedia"
    );


    const logoElement =
        $(`profileLogo${n}`);

    if (logoElement) {

        if (logo) {

            logoElement.src = logo;

            logoElement.style.display =
                "block";

            logoElement.onerror =
                () => {
                    logoElement.style.display =
                        "none";
                };

        } else {

            logoElement.style.display =
                "none";
        }
    }


    const headerLogo =
        $(`logo${n}`);

    if (headerLogo) {

        if (logo) {

            headerLogo.src = logo;
            headerLogo.style.display =
                "block";

            headerLogo.onerror =
                () => {
                    headerLogo.style.display =
                        "none";
                };

        } else {

            headerLogo.style.display =
                "none";
        }
    }
}


/* =========================
   DIVIDENDS
========================= */

function renderDividends(
    rawProfile,
    rawDividends,
    index
) {

    const n = index + 1;

    const profile =
        rawProfile?.data || {};

    /*
      Profile memiliki dividends[]
      dan saat ini lebih berguna daripada
      endpoint dividends yang default-nya
      hanya mengecek bulan berjalan.
    */

    let dividends =
        Array.isArray(profile.dividends)
            ? profile.dividends
            : [];


    if (
        dividends.length === 0 &&
        Array.isArray(
            rawDividends?.data?.items
        )
    ) {

        dividends =
            rawDividends.data.items;
    }


    const container =
        $(`dividendList${n}`);

    if (!container) return;

    container.innerHTML = "";


    if (dividends.length === 0) {

        const empty =
            document.createElement("div");

        empty.className =
            "empty-state";

        empty.textContent =
            "Belum ada data dividen pada respons API.";

        container.appendChild(empty);

        setText(
            `dividendTitle${n}`,
            "Dividen"
        );

        return;
    }


    setText(
        `dividendTitle${n}`,
        `Dividen ${profile.code || ""}`
    );


    dividends.forEach(
        (dividend) => {

            const card =
                document.createElement("div");

            card.className =
                "dividend-card";


            const title =
                document.createElement("h4");

            title.textContent =
                `Tahun buku ${dividend.bookYear || "—"}`;


            const info =
                document.createElement("div");

            info.className =
                "dividend-info";


            const rows = [
                [
                    "Cash per Share",
                    formatPrice(
                        dividend.cashPerShare
                    )
                ],
                [
                    "Cum Date",
                    formatDate(
                        dividend.cumDate
                    )
                ],
                [
                    "Ex Date",
                    formatDate(
                        dividend.exDate
                    )
                ],
                [
                    "Record Date",
                    formatDate(
                        dividend.recordDate
                    )
                ],
                [
                    "Payment Date",
                    formatDate(
                        dividend.paymentDate
                    )
                ]
            ];


            rows.forEach(
                ([label, value]) => {

                    const row =
                        document.createElement(
                            "div"
                        );

                    const labelEl =
                        document.createElement(
                            "span"
                        );

                    labelEl.textContent =
                        label;


                    const valueEl =
                        document.createElement(
                            "strong"
                        );

                    valueEl.textContent =
                        value;


                    row.appendChild(labelEl);
                    row.appendChild(valueEl);

                    info.appendChild(row);
                }
            );


            card.appendChild(title);
            card.appendChild(info);

            container.appendChild(card);
        }
    );
}


/* =========================
   FINANCIAL REPORTS
========================= */

function renderFinancial(
    rawFinancial,
    index
) {

    const n = index + 1;

    const container =
        $(`financialList${n}`);

    if (!container) return;

    container.innerHTML = "";


    const reports =
        rawFinancial?.data?.data || [];


    const attachments = [];


    reports.forEach(report => {

        const files =
            Array.isArray(
                report.Attachments
            )
                ? report.Attachments
                : [];

        files.forEach(file => {

            attachments.push({
                ...file,
                reportYear:
                    report.Report_Year ||
                    file.Report_Year,
                reportPeriod:
                    report.Report_Period ||
                    file.Report_Period
            });

        });
    });


    setText(
        `reportTitle${n}`,
        attachments.length
            ? `Dokumen Keuangan ${n}`
            : "Dokumen Keuangan"
    );


    if (attachments.length === 0) {

        const empty =
            document.createElement("div");

        empty.className =
            "empty-state";

        empty.textContent =
            "Belum ada dokumen keuangan.";

        container.appendChild(empty);

        return;
    }


    attachments.forEach(
        (file) => {

            const card =
                document.createElement("div");

            card.className =
                "document-card";


            const title =
                document.createElement("h4");

            title.textContent =
                file.File_Name ||
                "Dokumen keuangan";


            const meta =
                document.createElement("p");

            meta.textContent =
                [
                    file.Report_Year
                        ? `Tahun ${file.Report_Year}`
                        : null,

                    file.Report_Period
                        ? file.Report_Period
                        : null,

                    file.File_Type
                        ? file.File_Type
                        : null,

                    formatFileSize(
                        file.File_Size
                    )
                ]
                    .filter(Boolean)
                    .join(" • ");


            card.appendChild(title);
            card.appendChild(meta);

            /*
              File_Path dari financial-report
              belum kita anggap sebagai URL
              publik yang pasti.
              Jadi jangan membuat link palsu.
            */

            container.appendChild(card);
        }
    );
}


/* =========================
   OWNERSHIP FILES
========================= */

function renderOwnership(
    rawOwnership,
    index
) {

    const n = index + 1;

    const container =
        $(`ownershipList${n}`);

    if (!container) return;

    container.innerHTML = "";


    const files =
        rawOwnership?.data?.data || [];


    setText(
        `ownershipTitle${n}`,
        files.length
            ? `Dokumen Kepemilikan (${files.length})`
            : "Dokumen Kepemilikan"
    );


    if (files.length === 0) {

        const empty =
            document.createElement("div");

        empty.className =
            "empty-state";

        empty.textContent =
            "Belum ada dokumen kepemilikan.";

        container.appendChild(empty);

        return;
    }


    files.forEach(file => {

        const card =
            document.createElement("div");

        card.className =
            "document-card";


        const title =
            document.createElement("h4");

        title.textContent =
            file.fileName ||
            "Dokumen kepemilikan";


        const meta =
            document.createElement("p");

        meta.textContent =
            [
                file.categoryLabel,
                file.publishedAt
                    ? formatDate(
                        file.publishedAt
                    )
                    : null
            ]
                .filter(Boolean)
                .join(" • ");


        card.appendChild(title);
        card.appendChild(meta);


        if (file.url) {

            const link =
                document.createElement("a");

            link.href = file.url;

            link.target = "_blank";
            link.rel =
                "noopener noreferrer";

            link.textContent =
                "Buka Dokumen";

            link.className =
                "document-link";

            card.appendChild(link);
        }


        container.appendChild(card);
    });
}


/* =========================
   HISTORY
========================= */

function getHistory(rawHistory) {

    const items =
        rawHistory?.data?.items;

    if (!Array.isArray(items)) {
        return [];
    }

    return [...items].sort(
        (a, b) =>
            new Date(a.date) -
            new Date(b.date)
    );
}


/* =========================
   CHART
========================= */

function drawPriceChart(
    stockA,
    stockB
) {

    const canvas =
        $("priceChart");

    if (!canvas) return;


    const ctx =
        canvas.getContext("2d");


    const rect =
        canvas.getBoundingClientRect();


    const width =
        Math.max(
            rect.width,
            600
        );

    const height =
        Math.max(
            rect.height,
            300
        );


    const dpr =
        window.devicePixelRatio || 1;


    canvas.width =
        width * dpr;

    canvas.height =
        height * dpr;

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    const historyA =
        getHistory(
            stockA?.history
        );

    const historyB =
        getHistory(
            stockB?.history
        );


    if (
        historyA.length === 0 &&
        historyB.length === 0
    ) {

        setText(
            "chartSubtitle",
            "Data historis belum tersedia"
        );

        return;
    }


    setText(
        "chartSubtitle",
        "Pergerakan harga penutupan"
    );


    const dateMapA =
        new Map(
            historyA.map(item => [
                item.date,
                numberValue(
                    item.close
                )
            ])
        );


    const dateMapB =
        new Map(
            historyB.map(item => [
                item.date,
                numberValue(
                    item.close
                )
            ])
        );


    const dates =
        [
            ...new Set([
                ...historyA.map(
                    x => x.date
                ),
                ...historyB.map(
                    x => x.date
                )
            ])
        ].sort(
            (a, b) =>
                new Date(a) -
                new Date(b)
        );


    const values = [];


    dates.forEach(date => {

        const a =
            dateMapA.get(date);

        const b =
            dateMapB.get(date);

        if (a !== undefined) {
            values.push(a);
        }

        if (b !== undefined) {
            values.push(b);
        }
    });


    if (values.length === 0) return;


    const minValue =
        Math.min(...values);

    const maxValue =
        Math.max(...values);


    const range =
        maxValue - minValue || 1;


    const padding = {
        left: 65,
        right: 20,
        top: 25,
        bottom: 45
    };


    const chartWidth =
        width -
        padding.left -
        padding.right;

    const chartHeight =
        height -
        padding.top -
        padding.bottom;


    /* GRID */

    ctx.font =
        "12px Arial";

    ctx.textAlign =
        "right";

    ctx.textBaseline =
        "middle";


    for (
        let i = 0;
        i <= 5;
        i++
    ) {

        const y =
            padding.top +
            chartHeight *
            (i / 5);

        const value =
            maxValue -
            range *
            (i / 5);


        ctx.beginPath();

        ctx.moveTo(
            padding.left,
            y
        );

        ctx.lineTo(
            width -
            padding.right,
            y
        );

        ctx.strokeStyle =
            "rgba(128,128,128,0.2)";

        ctx.stroke();


        ctx.fillStyle =
            "rgba(128,128,128,0.8)";

        ctx.fillText(
            Math.round(value)
                .toLocaleString("id-ID"),
            padding.left - 10,
            y
        );
    }


    function drawLine(
        map,
        lineWidth
    ) {

        const points = [];


        dates.forEach(
            (date, index) => {

                const value =
                    map.get(date);

                if (
                    value === undefined ||
                    value === null
                ) {
                    return;
                }


                const x =
                    padding.left +
                    (
                        index /
                        Math.max(
                            dates.length - 1,
                            1
                        )
                    ) *
                    chartWidth;


                const y =
                    padding.top +
                    (
                        (maxValue -
                        value) /
                        range
                    ) *
                    chartHeight;


                points.push({
                    x,
                    y
                });
            }
        );


        if (points.length === 0) {
            return;
        }


        ctx.beginPath();

        points.forEach(
            (point, index) => {

                if (index === 0) {

                    ctx.moveTo(
                        point.x,
                        point.y
                    );

                } else {

                    ctx.lineTo(
                        point.x,
                        point.y
                    );
                }
            }
        );


        ctx.lineWidth =
            lineWidth;

        ctx.strokeStyle =
            "currentColor";

        /*
          Canvas tidak mendukung
          currentColor secara konsisten,
          jadi ambil warna default
          dari CSS.
        */

        ctx.strokeStyle =
            getComputedStyle(canvas)
                .color ||
            "#2563eb";

        ctx.stroke();
    }


    /*
      Untuk membedakan dua saham,
      gunakan warna dari CSS variables
      bila tersedia.
    */

    const root =
        getComputedStyle(
            document.documentElement
        );


    const color1 =
        root.getPropertyValue(
            "--primary"
        ).trim() ||
        "#2563eb";


    const color2 =
        root.getPropertyValue(
            "--accent"
        ).trim() ||
        "#f59e0b";


    function drawColoredLine(
        map,
        color
    ) {

        const points = [];


        dates.forEach(
            (date, index) => {

                const value =
                    map.get(date);

                if (
                    value === undefined ||
                    value === null
                ) {
                    return;
                }


                const x =
                    padding.left +
                    (
                        index /
                        Math.max(
                            dates.length - 1,
                            1
                        )
                    ) *
                    chartWidth;


                const y =
                    padding.top +
                    (
                        (maxValue -
                        value) /
                        range
                    ) *
                    chartHeight;


                points.push({
                    x,
                    y
                });
            }
        );


        if (points.length === 0) {
            return;
        }


        ctx.beginPath();

        points.forEach(
            (point, index) => {

                if (index === 0) {

                    ctx.moveTo(
                        point.x,
                        point.y
                    );

                } else {

                    ctx.lineTo(
                        point.x,
                        point.y
                    );
                }
            }
        );


        ctx.lineWidth = 2.5;

        ctx.strokeStyle = color;

        ctx.stroke();


        /*
          Titik terakhir
        */

        const last =
            points[points.length - 1];

        ctx.beginPath();

        ctx.arc(
            last.x,
            last.y,
            4,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            color;

        ctx.fill();
    }


    drawColoredLine(
        dateMapA,
        color1
    );


    drawColoredLine(
        dateMapB,
        color2
    );


    /* X AXIS LABEL */

    ctx.fillStyle =
        "rgba(128,128,128,0.8)";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "top";


    const labelCount =
        Math.min(
            5,
            dates.length
        );


    for (
        let i = 0;
        i < labelCount;
        i++
    ) {

        const index =
            Math.round(
                i *
                (
                    (dates.length - 1) /
                    Math.max(
                        labelCount - 1,
                        1
                    )
                )
            );


        const date =
            dates[index];


        const x =
            padding.left +
            (
                index /
                Math.max(
                    dates.length - 1,
                    1
                )
            ) *
            chartWidth;


        ctx.fillText(
            formatDate(date),
            x,
            height - 30
        );
    }


    /* LEGEND */

    setText(
        "chartLegend1",
        stockA?.summary?.symbol ||
        "Saham 1"
    );

    setText(
        "chartLegend2",
        stockB?.summary?.symbol ||
        "Saham 2"
    );
}


/* =========================
   QUICK COMPARISON
========================= */

function renderComparison(
    stock,
    index
) {

    if (!stock) return;

    const n = index + 1;

    const summary =
        stock.summary || {};

    const profile =
        stock.profile?.data || {};


    setText(
        `tableTicker${n}`,
        summary.symbol ||
        profile.code
    );

    setText(
        `tablePrice${n}`,
        formatPrice(
            summary.price
        )
    );


    const dividends =
        Array.isArray(
            profile.dividends
        )
            ? profile.dividends
            : [];


    if (dividends.length > 0) {

        const latest =
            dividends[0];

        setText(
            `tableDividend${n}`,
            formatPrice(
                latest.cashPerShare
            )
        );

    } else {

        setText(
            `tableDividend${n}`,
            "Belum tersedia"
        );
    }


    /*
      Fundamental belum tersedia
      dari endpoint yang kita gunakan.
    */

    setText(
        `tablePer${n}`,
        "Belum tersedia"
    );

    setText(
        `tablePbv${n}`,
        "Belum tersedia"
    );


    setText(
        `tableVolume${n}`,
        formatNumber(
            summary.volume
        )
    );

    setText(
        `tableForeignBuy${n}`,
        formatNumber(
            summary.foreignBuy
        )
    );

    setText(
        `tableForeignSell${n}`,
        formatNumber(
            summary.foreignSell
        )
    );
}


/* =========================
   LOAD ONE STOCK
========================= */

async function loadStock(
    ticker,
    index
) {

    const stock =
        await fetchStock(ticker);


    stockResults[index] =
        stock;


    renderSummary(
        stock.summary,
        index
    );


    renderProfile(
        stock.profile,
        index
    );


    renderDividends(
        stock.profile,
        stock.dividends,
        index
    );


    renderFinancial(
        stock.financial,
        index
    );


    renderOwnership(
        stock.ownership,
        index
    );


    renderComparison(
        stock,
        index
    );


    return stock;
}


/* =========================
   UI STATUS
========================= */

function setLoading(
    loading
) {

    const resultSection =
        $("resultSection");

    if (!resultSection) return;

    if (loading) {

        resultSection.classList.add(
            "loading"
        );

    } else {

        resultSection.classList.remove(
            "loading"
        );
    }
}


function setStatus(
    message
) {

    const candidates = [
        "status",
        "loadingStatus",
        "searchStatus"
    ];


    for (
        const id of candidates
    ) {

        const el = $(id);

        if (el) {

            el.textContent =
                message;

            return;
        }
    }
}


/* =========================
   MAIN SEARCH
========================= */

async function compareStocks() {

    const input1 =
        $("ticker1Input");

    const input2 =
        $("ticker2Input");


    /*
      Jika ID berbeda, coba beberapa
      kemungkinan umum.
    */

    const firstInput =
        input1 ||
        $("stock1") ||
        $("symbol1") ||
        $("ticker1");


    const secondInput =
        input2 ||
        $("stock2") ||
        $("symbol2") ||
        $("ticker2");


    if (!firstInput) {

        console.error(
            "Input saham pertama tidak ditemukan."
        );

        return;
    }


    const ticker1 =
        firstInput.value
            .trim()
            .toUpperCase()
            .replace(/\.JK$/, "");


    const ticker2 =
        secondInput
            ? secondInput.value
                .trim()
                .toUpperCase()
                .replace(/\.JK$/, "")
            : "";


    if (!ticker1) {

        setStatus(
            "Masukkan kode saham pertama."
        );

        return;
    }


    setLoading(true);

    setStatus(
        "Mengambil data saham..."
    );


    stockResults = [
        null,
        null
    ];


    try {

        const requests = [
            loadStock(
                ticker1,
                0
            )
        ];


        if (ticker2) {

            requests.push(
                loadStock(
                    ticker2,
                    1
                )
            );

        } else {

            stockResults[1] =
                null;
        }


        await Promise.all(
            requests
        );


        drawPriceChart(
            stockResults[0],
            stockResults[1]
        );


        const resultSection =
            $("resultSection");

        if (resultSection) {

            resultSection.style.display =
                "block";
        }


        setStatus(
            "Data berhasil diperbarui."
        );


    } catch (error) {

        console.error(error);

        setStatus(
            `Terjadi kesalahan: ${error.message}`
        );

    } finally {

        setLoading(false);
    }
}


/* =========================
   ENTER KEY
========================= */

function setupEnterKey() {

    const inputs =
        document.querySelectorAll(
            "input"
        );


    inputs.forEach(input => {

        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    compareStocks();
                }
            }
        );


        input.addEventListener(
            "input",
            () => {

                input.value =
                    input.value.toUpperCase();
            }
        );
    });
}


/* =========================
   SEARCH BUTTON
========================= */

function setupSearchButton() {

    const possibleButtons = [
        "compareBtn",
        "compareButton",
        "searchBtn",
        "searchButton",
        "compareStocksBtn"
    ];


    for (
        const id of possibleButtons
    ) {

        const button = $(id);

        if (button) {

            button.addEventListener(
                "click",
                compareStocks
            );

            return;
        }
    }


    /*
      Kalau tombol memakai class,
      cari button pertama yang relevan.
    */

    const buttons =
        document.querySelectorAll(
            "button"
        );


    buttons.forEach(button => {

        const text =
            button.textContent
                .toLowerCase();

        if (
            text.includes("banding") ||
            text.includes("compare") ||
            text.includes("cari") ||
            text.includes("search")
        ) {

            button.addEventListener(
                "click",
                compareStocks
            );
        }
    });
}


/* =========================
   DARK MODE
========================= */

function setupTheme() {

    const themeButton =
        $("themeToggle") ||
        $("darkModeToggle") ||
        $("themeBtn");


    if (!themeButton) return;


    themeButton.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "dark-mode"
            );

            document.documentElement.classList.toggle(
                "dark-mode"
            );


            const isDark =
                document.body.classList.contains(
                    "dark-mode"
                );


            localStorage.setItem(
                "stock-theme",
                isDark
                    ? "dark"
                    : "light"
            );


            /*
              Redraw chart supaya warna
              tetap mengikuti tema.
            */

            drawPriceChart(
                stockResults[0],
                stockResults[1]
            );
        }
    );


    const saved =
        localStorage.getItem(
            "stock-theme"
        );


    if (saved === "dark") {

        document.body.classList.add(
            "dark-mode"
        );

        document.documentElement.classList.add(
            "dark-mode"
        );
    }
}


/* =========================
   RESPONSIVE CHART
========================= */

window.addEventListener(
    "resize",
    () => {

        if (
            stockResults[0] ||
            stockResults[1]
        ) {

            drawPriceChart(
                stockResults[0],
                stockResults[1]
            );
        }
    }
);


/* =========================
   INITIALIZATION
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupEnterKey();

        setupSearchButton();

        setupTheme();

        console.log(
            "Indonesia Stock Comparison V2 siap."
        );
    }
);
