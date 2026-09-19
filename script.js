```javascript
const API_URL =
    "https://indonesia-stock-comparison.sayyid-syafiq136.workers.dev";


/* =====================================================
   GLOBAL STATE
===================================================== */

let priceChart = null;


/* =====================================================
   FORMATTERS
===================================================== */

function formatNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === "" ||
        Number.isNaN(Number(value))
    ) {
        return "Data tidak tersedia";
    }

    return Number(value).toLocaleString("id-ID");
}


function formatRupiah(value) {

    if (
        value === null ||
        value === undefined ||
        value === "" ||
        Number.isNaN(Number(value))
    ) {
        return "Data tidak tersedia";
    }

    return "Rp " +
        Number(value).toLocaleString("id-ID");
}


function formatPercent(value) {

    if (
        value === null ||
        value === undefined ||
        value === "" ||
        Number.isNaN(Number(value))
    ) {
        return "Data tidak tersedia";
    }

    return Number(value).toFixed(2) + "%";
}


function formatDate(value) {

    if (!value) {
        return "Tanggal tidak tersedia";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
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


function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =====================================================
   API
===================================================== */

async function fetchAPI(
    symbol,
    type
) {

    const url =
        `${API_URL}/?symbol=${encodeURIComponent(symbol)}&type=${encodeURIComponent(type)}`;

    const response =
        await fetch(url);

    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error(
            `Respons ${type} bukan JSON yang valid.`
        );
    }

    if (
        !response.ok ||
        data?.error
    ) {

        throw new Error(
            data?.detail ||
            data?.error ||
            `Gagal mengambil ${type}.`
        );
    }

    return data;
}


/*
    Mengambil seluruh data satu saham.

    Setiap endpoint dibuat independen.
    Kalau satu gagal, endpoint lainnya
    tetap dicoba.
*/

async function fetchCompleteStock(
    symbol
) {

    const types = [
        "summary",
        "history",
        "dividends",
        "financial",
        "profile",
        "ownership"
    ];

    const results = {};

    await Promise.all(

        types.map(
            async function(type) {

                try {

                    results[type] =
                        await fetchAPI(
                            symbol,
                            type
                        );

                } catch (error) {

                    console.warn(
                        `${symbol} ${type}:`,
                        error.message
                    );

                    results[type] = null;
                }

            }
        )

    );

    return results;
}


/* =====================================================
   GENERIC DATA EXTRACTION
===================================================== */

/*
    Zapi mempunyai struktur response berbeda
    untuk setiap endpoint.

    Fungsi berikut mencari array data
    tanpa mengharuskan kita menebak satu
    struktur tertentu.
*/

function findFirstArray(
    object
) {

    if (!object || typeof object !== "object") {
        return null;
    }

    if (Array.isArray(object)) {
        return object;
    }

    for (
        const key of Object.keys(object)
    ) {

        const value =
            object[key];

        if (Array.isArray(value)) {

            if (
                value.length === 0 ||
                typeof value[0] === "object"
            ) {
                return value;
            }

        }

        if (
            value &&
            typeof value === "object"
        ) {

            const result =
                findFirstArray(value);

            if (result) {
                return result;
            }

        }

    }

    return null;
}


function getDataArray(
    response
) {

    if (!response) {
        return [];
    }

    if (Array.isArray(response)) {
        return response;
    }

    if (
        response.data &&
        Array.isArray(response.data)
    ) {
        return response.data;
    }

    if (
        response.data?.data &&
        Array.isArray(response.data.data)
    ) {
        return response.data.data;
    }

    const found =
        findFirstArray(response);

    return found || [];
}


function findValue(
    object,
    possibleKeys
) {

    if (
        !object ||
        typeof object !== "object"
    ) {
        return null;
    }

    const keys =
        Object.keys(object);

    for (
        const wantedKey of possibleKeys
    ) {

        const exact =
            keys.find(
                key =>
                    key.toLowerCase() ===
                    wantedKey.toLowerCase()
            );

        if (exact) {
            return object[exact];
        }

    }

    for (
        const wantedKey of possibleKeys
    ) {

        const partial =
            keys.find(
                key =>
                    key.toLowerCase().includes(
                        wantedKey.toLowerCase()
                    )
            );

        if (partial) {
            return object[partial];
        }

    }

    return null;
}


/* =====================================================
   UI HELPERS
===================================================== */

function setStatus(
    message,
    type = ""
) {

    const status =
        document.getElementById(
            "status"
        );

    if (!status) return;

    status.textContent =
        message;

    status.className =
        "status";

    if (type) {
        status.classList.add(type);
    }
}


function setLoading(
    loading
) {

    const button =
        document.getElementById(
            "compareButton"
        );

    const text =
        document.getElementById(
            "buttonText"
        );

    if (!button || !text) {
        return;
    }

    button.disabled =
        loading;

    button.style.opacity =
        loading ? "0.7" : "1";

    text.textContent =
        loading
            ? "Mengambil seluruh data..."
            : "Bandingkan Saham";
}


function getTickerLogo(
    symbol
) {

    if (!symbol) {
        return "--";
    }

    return String(symbol)
        .replace(".JK", "")
        .substring(0, 2);
}


function setText(
    id,
    value,
    fallback = "Data tidak tersedia"
) {

    const element =
        document.getElementById(id);

    if (!element) return;

    element.textContent =
        value === null ||
        value === undefined ||
        value === ""
            ? fallback
            : value;
}


/* =====================================================
   SUMMARY
===================================================== */

function displaySummary(
    stock,
    number
) {

    if (!stock) {
        return;
    }

    const suffix =
        number === 1
            ? "1"
            : "2";

    setText(
        `name${suffix}`,
        stock.name,
        "Unknown Company"
    );

    setText(
        `ticker${suffix}`,
        stock.symbol,
        "---"
    );

    setText(
        `price${suffix}`,
        formatRupiah(stock.price)
    );

    const logo =
        document.getElementById(
            `logo${suffix}`
        );

    if (logo) {

        logo.textContent =
            getTickerLogo(
                stock.symbol
            );
    }


    const changeElement =
        document.getElementById(
            `change${suffix}`
        );

    if (changeElement) {

        changeElement.classList.remove(
            "positive",
            "negative"
        );

        if (
            stock.change === null ||
            stock.change === undefined
        ) {

            changeElement.textContent =
                "Data tidak tersedia";

        } else {

            const sign =
                Number(stock.change) > 0
                    ? "+"
                    : "";

            changeElement.textContent =
                `${sign}${formatRupiah(stock.change)} (${sign}${formatPercent(stock.changePercent)})`;

            if (
                Number(stock.change) > 0
            ) {

                changeElement.classList.add(
                    "positive"
                );

            } else if (
                Number(stock.change) < 0
            ) {

                changeElement.classList.add(
                    "negative"
                );

            }

        }

    }


    setText(
        `open${suffix}`,
        formatRupiah(stock.open)
    );

    setText(
        `high${suffix}`,
        formatRupiah(stock.high)
    );

    setText(
        `low${suffix}`,
        formatRupiah(stock.low)
    );

    setText(
        `volume${suffix}`,
        formatNumber(stock.volume)
    );

    setText(
        `value${suffix}`,
        formatRupiah(stock.value)
    );

    setText(
        `frequency${suffix}`,
        formatNumber(stock.frequency)
    );

    setText(
        `bid${suffix}`,
        formatRupiah(stock.bid)
    );

    setText(
        `offer${suffix}`,
        formatRupiah(stock.offer)
    );

    setText(
        `foreignBuy${suffix}`,
        formatNumber(stock.foreignBuy)
    );

    setText(
        `foreignSell${suffix}`,
        formatNumber(stock.foreignSell)
    );

    setText(
        `marketTitle${suffix}`,
        stock.symbol
            ? `${stock.symbol} Market Data`
            : "Market Data"
    );

}


/* =====================================================
   HISTORY
===================================================== */

function normalizeHistory(
    response
) {

    const rows =
        getDataArray(response);

    return rows
        .map(
            function(row) {

                if (
                    !row ||
                    typeof row !== "object"
                ) {
                    return null;
                }

                const date =
                    findValue(
                        row,
                        [
                            "Date",
                            "date",
                            "Datetime",
                            "datetime",
                            "Time",
                            "time"
                        ]
                    );

                const close =
                    findValue(
                        row,
                        [
                            "Close",
                            "close",
                            "ClosingPrice",
                            "ClosePrice",
                            "Last"
                        ]
                    );

                const numericClose =
                    Number(close);

                if (
                    !date ||
                    Number.isNaN(
                        numericClose
                    )
                ) {
                    return null;
                }

                return {
                    date,
                    close: numericClose
                };

            }
        )
        .filter(Boolean)
        .sort(
            (a, b) =>
                new Date(a.date) -
                new Date(b.date)
        );
}


/* =====================================================
   SIMPLE CANVAS CHART
===================================================== */

function drawPriceChart(
    history1,
    history2,
    symbol1,
    symbol2
) {

    const canvas =
        document.getElementById(
            "priceChart"
        );

    if (!canvas) return;

    const loading =
        document.getElementById(
            "chartLoading"
        );

    if (loading) {
        loading.style.display =
            "none";
    }


    const ctx =
        canvas.getContext("2d");

    const rect =
        canvas.getBoundingClientRect();

    const ratio =
        window.devicePixelRatio || 1;

    canvas.width =
        rect.width * ratio;

    canvas.height =
        rect.height * ratio;

    ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );


    const width =
        rect.width;

    const height =
        rect.height;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    const allPrices = [
        ...history1.map(
            item => item.close
        ),
        ...history2.map(
            item => item.close
        )
    ];


    if (!allPrices.length) {

        ctx.fillStyle =
            getComputedStyle(
                document.body
            )
            .getPropertyValue(
                "--text-secondary"
            );

        ctx.font =
            "13px sans-serif";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "Data historis belum tersedia",
            width / 2,
            height / 2
        );

        return;
    }


    const minPrice =
        Math.min(...allPrices);

    const maxPrice =
        Math.max(...allPrices);

    const range =
        maxPrice - minPrice ||
        1;


    const padding = {
        top: 25,
        right: 25,
        bottom: 35,
        left: 65
    };


    const chartWidth =
        width -
        padding.left -
        padding.right;

    const chartHeight =
        height -
        padding.top -
        padding.bottom;


    const styles =
        getComputedStyle(
            document.body
        );


    const textColor =
        styles.getPropertyValue(
            "--text-secondary"
        ).trim() ||
        "#64748b";

    const borderColor =
        styles.getPropertyValue(
            "--border"
        ).trim() ||
        "#e5e7eb";


    /*
        GRID
    */

    ctx.strokeStyle =
        borderColor;

    ctx.lineWidth = 1;

    for (
        let i = 0;
        i <= 4;
        i++
    ) {

        const y =
            padding.top +
            (
                chartHeight *
                i /
                4
            );

        ctx.beginPath();

        ctx.moveTo(
            padding.left,
            y
        );

        ctx.lineTo(
            width - padding.right,
            y
        );

        ctx.stroke();


        const value =
            maxPrice -
            (
                range *
                i /
                4
            );

        ctx.fillStyle =
            textColor;

        ctx.font =
            "10px sans-serif";

        ctx.textAlign =
            "right";

        ctx.fillText(
            formatRupiah(
                Math.round(value)
            ),
            padding.left - 8,
            y + 3
        );

    }


    function drawLine(
        history,
        lineType
    ) {

        if (!history.length) {
            return;
        }


        /*
            Warna otomatis dari CSS variable.
            Tidak perlu menambah library chart.
        */

        const color =
            lineType === 1
                ? (
                    styles.getPropertyValue(
                        "--primary"
                    ).trim() ||
                    "#2563eb"
                )
                : (
                    styles.getPropertyValue(
                        "--positive"
                    ).trim() ||
                    "#16a34a"
                );


        ctx.strokeStyle =
            color;

        ctx.lineWidth = 2.5;

        ctx.lineJoin =
            "round";

        ctx.lineCap =
            "round";

        ctx.beginPath();


        history.forEach(
            function(item, index) {

                const x =
                    padding.left +
                    (
                        index /
                        Math.max(
                            history.length - 1,
                            1
                        )
                    ) *
                    chartWidth;


                const y =
                    padding.top +
                    (
                        (
                            maxPrice -
                            item.close
                        ) /
                        range
                    ) *
                    chartHeight;


                if (index === 0) {

                    ctx.moveTo(
                        x,
                        y
                    );

                } else {

                    ctx.lineTo(
                        x,
                        y
                    );

                }

            }
        );


        ctx.stroke();


        /*
            TITIK TERAKHIR
        */

        const last =
            history[
                history.length - 1
            ];

        if (last) {

            const x =
                padding.left +
                chartWidth;

            const y =
                padding.top +
                (
                    (
                        maxPrice -
                        last.close
                    ) /
                    range
                ) *
                chartHeight;

            ctx.fillStyle =
                color;

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                4,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }

    }


    drawLine(
        history1,
        1
    );

    drawLine(
        history2,
        2
    );


    /*
        LABEL TANGGAL
    */

    const longest =
        history1.length >=
        history2.length
            ? history1
            : history2;

    if (longest.length) {

        const first =
            longest[0];

        const last =
            longest[
                longest.length - 1
            ];

        ctx.fillStyle =
            textColor;

        ctx.font =
            "10px sans-serif";

        ctx.textAlign =
            "left";

        ctx.fillText(
            formatDate(first.date),
            padding.left,
            height - 10
        );

        ctx.textAlign =
            "right";

        ctx.fillText(
            formatDate(last.date),
            width - padding.right,
            height - 10
        );

    }


    setText(
        "chartLegend1",
        `● ${symbol1}`
    );

    setText(
        "chartLegend2",
        `● ${symbol2}`
    );

    setText(
        "chartSubtitle",
        `${symbol1} vs ${symbol2}`
    );

}


/* =====================================================
   DIVIDEND
===================================================== */

function normalizeDividends(
    response
) {

    const rows =
        getDataArray(response);

    return rows
        .map(
            function(row) {

                if (
                    !row ||
                    typeof row !== "object"
                ) {
                    return null;
                }

                const date =
                    findValue(
                        row,
                        [
                            "PaymentDate",
                            "paymentDate",
                            "Payment",
                            "payment",
                            "ExDate",
                            "exDate",
                            "Date",
                            "date"
                        ]
                    );

                const amount =
                    findValue(
                        row,
                        [
                            "Amount",
                            "amount",
                            "Dividend",
                            "dividend",
                            "DPS",
                            "dps",
                            "Value",
                            "value"
                        ]
                    );

                const type =
                    findValue(
                        row,
                        [
                            "Type",
                            "type",
                            "Description",
                            "description"
                        ]
                    );

                return {
                    date,
                    amount,
                    type
                };

            }
        )
        .filter(
            item =>
                item &&
                (
                    item.date ||
                    item.amount
                )
        );

}


function displayDividends(
    response,
    number,
    symbol
) {

    const suffix =
        number === 1
            ? "1"
            : "2";

    const container =
        document.getElementById(
            `dividendList${suffix}`
        );

    if (!container) {
        return;
    }

    setText(
        `dividendTitle${suffix}`,
        `${symbol} Dividend`
    );


    const rows =
        normalizeDividends(
            response
        );


    if (!rows.length) {

        container.innerHTML =
            `
            <div class="empty-data">
                Data dividen tidak tersedia.
            </div>
            `;

        return;
    }


    container.innerHTML =
        rows
            .slice(0, 15)
            .map(
                function(item) {

                    const amount =
                        Number(item.amount);

                    const amountText =
                        Number.isNaN(amount)
                            ? (
                                item.amount ??
                                "Data tidak tersedia"
                            )
                            : formatRupiah(
                                amount
                            );

                    return `
                        <div class="dividend-item">

                            <div>
                                <strong>
                                    ${escapeHTML(amountText)}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        item.type ||
                                        "Dividend"
                                    )}
                                </span>
                            </div>

                            <span>
                                ${escapeHTML(
                                    formatDate(
                                        item.date
                                    )
                                )}
                            </span>

                        </div>
                    `;

                }
            )
            .join("");

}


/* =====================================================
   FINANCIAL REPORT
===================================================== */

function normalizeDocuments(
    response
) {

    const rows =
        getDataArray(response);

    const documents = [];


    function scan(
        value
    ) {

        if (
            !value ||
            typeof value !== "object"
        ) {
            return;
        }


        if (Array.isArray(value)) {

            value.forEach(
                item =>
                    scan(item)
            );

            return;
        }


        const name =
            findValue(
                value,
                [
                    "FileName",
                    "filename",
                    "File",
                    "file",
                    "Name",
                    "name",
                    "Title",
                    "title",
                    "DocumentName"
                ]
            );


        const url =
            findValue(
                value,
                [
                    "URL",
                    "Url",
                    "url",
                    "DownloadURL",
                    "downloadUrl",
                    "Link",
                    "link"
                ]
            );


        const fileId =
            findValue(
                value,
                [
                    "File_ID",
                    "FileID",
                    "file_id",
                    "fileId"
                ]
            );


        if (
            name ||
            url ||
            fileId
        ) {

            documents.push({
                name:
                    name ||
                    "Dokumen",
                url:
                    url ||
                    null,
                fileId:
                    fileId ||
                    null
            });

        }


        Object.keys(value)
            .forEach(
                key =>
                    scan(value[key])
            );

    }


    scan(rows);

    return documents;

}


function displayFinancial(
    response,
    number,
    symbol
) {

    const suffix =
        number === 1
            ? "1"
            : "2";

    const container =
        document.getElementById(
            `financialList${suffix}`
        );

    if (!container) {
        return;
    }

    setText(
        `reportTitle${suffix}`,
        `${symbol} Financial Report`
    );


    const documents =
        normalizeDocuments(
            response
        );


    if (!documents.length) {

        container.innerHTML =
            `
            <div class="empty-data">
                Laporan keuangan tidak tersedia.
            </div>
            `;

        return;
    }


    const unique =
        [];

    const seen =
        new Set();


    documents.forEach(
        function(document) {

            const key =
                document.name;

            if (
                !seen.has(key)
            ) {

                seen.add(key);

                unique.push(
                    document
                );

            }

        }
    );


    container.innerHTML =
        unique
            .slice(0, 20)
            .map(
                function(document) {

                    let action =
                        "";

                    if (
                        document.url
                    ) {

                        action =
                            `
                            <a
                                class="document-link"
                                href="${escapeHTML(document.url)}"
                                target="_blank"
                                rel="noopener"
                            >
                                Buka
                            </a>
                            `;

                    } else {

                        action =
                            `
                            <span
                                class="document-link"
                                title="File ID tersedia dari API"
                            >
                                Dokumen
                            </span>
                            `;

                    }


                    return `
                        <div class="document-item">

                            <div class="document-info">

                                <strong>
                                    ${escapeHTML(
                                        document.name
                                    )}
                                </strong>

                                <span>
                                    Financial Report
                                </span>

                            </div>

                            ${action}

                        </div>
                    `;

                }
            )
            .join("");

}


/* =====================================================
   OWNERSHIP
===================================================== */

function displayOwnership(
    response,
    number,
    symbol
) {

    const suffix =
        number === 1
            ? "1"
            : "2";

    const container =
        document.getElementById(
            `ownershipList${suffix}`
        );

    if (!container) {
        return;
    }

    setText(
        `ownershipTitle${suffix}`,
        `${symbol} Ownership`
    );


    const documents =
        normalizeDocuments(
            response
        );


    if (!documents.length) {

        container.innerHTML =
            `
            <div class="empty-data">
                Data ownership tidak tersedia.
            </div>
            `;

        return;
    }


    const unique =
        [];

    const seen =
        new Set();


    documents.forEach(
        function(document) {

            const key =
                document.name;

            if (
                !seen.has(key)
            ) {

                seen.add(key);

                unique.push(
                    document
                );

            }

        }
    );


    container.innerHTML =
        unique
            .slice(0, 20)
            .map(
                function(document) {

                    let action =
                        "";

                    if (
                        document.url
                    ) {

                        action =
                            `
                            <a
                                class="document-link"
                                href="${escapeHTML(document.url)}"
                                target="_blank"
                                rel="noopener"
                            >
                                Buka
                            </a>
                            `;

                    } else {

                        action =
                            `
                            <span class="document-link">
                                Dokumen
                            </span>
                            `;

                    }


                    return `
                        <div class="document-item">

                            <div class="document-info">

                                <strong>
                                    ${escapeHTML(
                                        document.name
                                    )}
                                </strong>

                                <span>
                                    Ownership File
                                </span>

                            </div>

                            ${action}

                        </div>
                    `;

                }
            )
            .join("");

}


/* =====================================================
   COMPANY PROFILE
===================================================== */

function displayProfile(
    response,
    number,
    fallbackSummary
) {

    const suffix =
        number === 1
            ? "1"
            : "2";

    if (!response) {
        return;
    }


    /*
        Profile Zapi bisa mempunyai
        data di dalam data.
    */

    const rows =
        getDataArray(response);

    const profile =
        rows[0] ||
        response?.data?.data?.[0] ||
        response?.data ||
        response;


    if (
        !profile ||
        typeof profile !== "object"
    ) {
        return;
    }


    const name =
        findValue(
            profile,
            [
                "name",
                "Name",
                "CompanyName",
                "companyName",
                "StockName",
                "stockName"
            ]
        );


    const symbol =
        findValue(
            profile,
            [
                "symbol",
                "Symbol",
                "StockCode",
                "stockCode",
                "Code",
                "code"
            ]
        );


    const sector =
        findValue(
            profile,
            [
                "sector",
                "Sector"
            ]
        );


    const industry =
        findValue(
            profile,
            [
                "industry",
                "Industry"
            ]
        );


    const employees =
        findValue(
            profile,
            [
                "employees",
                "Employees",
                "EmployeeCount",
                "employeeCount"
            ]
        );


    const website =
        findValue(
            profile,
            [
                "website",
                "Website",
                "WebSite",
                "url",
                "URL"
            ]
        );


    const description =
        findValue(
            profile,
            [
                "description",
                "Description",
                "BusinessDescription",
                "businessDescription"
            ]
        );


    setText(
        `profileName${suffix}`,
        name ||
        fallbackSummary?.name ||
        "Unknown Company"
    );


    setText(
        `profileTicker${suffix}`,
        symbol ||
        fallbackSummary?.symbol ||
        "---"
    );


    setText(
        `sector${suffix}`,
        sector
    );


    setText(
        `industry${suffix}`,
        industry
    );


    setText(
        `employees${suffix}`,
        employees !== null
            ? formatNumber(employees)
            : null
    );


    const websiteElement =
        document.getElementById(
            `website${suffix}`
        );

    if (websiteElement) {

        if (website) {

            let websiteURL =
                String(website)
                    .trim();

            if (
                !/^https?:\/\//i.test(
                    websiteURL
                )
            ) {

                websiteURL =
                    "https://" +
                    websiteURL;

            }

            websiteElement.href =
                websiteURL;

            websiteElement.textContent =
                website;

        } else {

            websiteElement.removeAttribute(
                "href"
            );

            websiteElement.textContent =
                "Data tidak tersedia";

        }

    }


    setText(
        `description${suffix}`,
        description,
        "Deskripsi perusahaan tidak tersedia."
    );


    const logo =
        document.getElementById(
            `profileLogo${suffix}`
        );

    if (logo) {

        logo.textContent =
            getTickerLogo(
                symbol ||
                fallbackSummary?.symbol
            );

    }

}


/* =====================================================
   QUICK COMPARISON
===================================================== */

function displayComparison(
    stock1,
    stock2
) {

    setText(
        "tableTicker1",
        stock1?.symbol
    );

    setText(
        "tableTicker2",
        stock2?.symbol
    );


    setText(
        "tablePrice1",
        formatRupiah(
            stock1?.price
        )
    );

    setText(
        "tablePrice2",
        formatRupiah(
            stock2?.price
        )
    );


    setText(
        "tableVolume1",
        formatNumber(
            stock1?.volume
        )
    );

    setText(
        "tableVolume2",
        formatNumber(
            stock2?.volume
        )
    );


    setText(
        "tableForeignBuy1",
        formatNumber(
            stock1?.foreignBuy
        )
    );

    setText(
        "tableForeignBuy2",
        formatNumber(
            stock2?.foreignBuy
        )
    );


    setText(
        "tableForeignSell1",
        formatNumber(
            stock1?.foreignSell
        )
    );

    setText(
        "tableForeignSell2",
        formatNumber(
            stock2?.foreignSell
        )
    );


    /*
        PER & PBV sengaja belum diisi.
        Kita tidak memasukkan angka palsu.
    */

    setText(
        "tablePer1",
        "Belum tersedia"
    );

    setText(
        "tablePer2",
        "Belum tersedia"
    );

    setText(
        "tablePbv1",
        "Belum tersedia"
    );

    setText(
        "tablePbv2",
        "Belum tersedia"
    );

}


/* =====================================================
   LOAD CHART
===================================================== */

async function loadChart(
    stock1,
    stock2,
    symbol1,
    symbol2
) {

    const history1 =
        normalizeHistory(
            stock1
        );

    const history2 =
        normalizeHistory(
            stock2
        );


    drawPriceChart(
        history1,
        history2,
        symbol1,
        symbol2
    );

}


/* =====================================================
   COMPARE EVERYTHING
===================================================== */

async function compareStocks() {

    const input1 =
        document.getElementById(
            "stock1"
        );

    const input2 =
        document.getElementById(
            "stock2"
        );


    if (!input1 || !input2) {
        return;
    }


    const ticker1 =
        input1.value
            .toUpperCase()
            .trim();


    const ticker2 =
        input2.value
            .toUpperCase()
            .trim();


    if (
        !ticker1 ||
        !ticker2
    ) {

        setStatus(
            "Masukkan dua ticker saham terlebih dahulu.",
            "error"
        );

        return;
    }


    if (
        ticker1 === ticker2
    ) {

        setStatus(
            "Pilih dua saham yang berbeda.",
            "error"
        );

        return;
    }


    setLoading(true);


    setStatus(
        "Mengambil market data, chart, dividend, laporan, profile, dan ownership...",
        "loading"
    );


    try {

        /*
            Ambil seluruh data kedua saham.
        */

        const [
            complete1,
            complete2
        ] = await Promise.all([
            fetchCompleteStock(ticker1),
            fetchCompleteStock(ticker2)
        ]);


        /*
            SUMMARY
        */

        const stock1 =
            complete1.summary;

        const stock2 =
            complete2.summary;


        if (!stock1) {

            throw new Error(
                `${ticker1}: market data tidak tersedia.`
            );

        }


        if (!stock2) {

            throw new Error(
                `${ticker2}: market data tidak tersedia.`
            );

        }


        /*
            TAMPILKAN RESULT
        */

        const result =
            document.getElementById(
                "result"
            );

        const comparison =
            document.getElementById(
                "comparison"
            );


        if (result) {

            result.classList.remove(
                "hidden"
            );

        }


        if (comparison) {

            comparison.classList.remove(
                "hidden"
            );

        }


        /*
            SUMMARY
        */

        displaySummary(
            stock1,
            1
        );

        displaySummary(
            stock2,
            2
        );


        /*
            PROFILE
        */

        displayProfile(
            complete1.profile,
            1,
            stock1
        );

        displayProfile(
            complete2.profile,
            2,
            stock2
        );


        /*
            DIVIDEND
        */

        displayDividends(
            complete1.dividends,
            1,
            stock1.symbol
        );

        displayDividends(
            complete2.dividends,
            2,
            stock2.symbol
        );


        /*
            FINANCIAL REPORT
        */

        displayFinancial(
            complete1.financial,
            1,
            stock1.symbol
        );

        displayFinancial(
            complete2.financial,
            2,
            stock2.symbol
        );


        /*
            OWNERSHIP
        */

        displayOwnership(
            complete1.ownership,
            1,
            stock1.symbol
        );

        displayOwnership(
            complete2.ownership,
            2,
            stock2.symbol
        );


        /*
            CHART
        */

        await loadChart(
            complete1.history,
            complete2.history,
            stock1.symbol,
            stock2.symbol
        );


        /*
            COMPARISON
        */

        displayComparison(
            stock1,
            stock2
        );


        /*
            STATUS
        */

        setStatus(
            `Perbandingan ${stock1.symbol} vs ${stock2.symbol} berhasil dibuat.`,
            "success"
        );


        /*
            SCROLL
        */

        if (result) {

            result.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }


    } catch (error) {

        console.error(
            "Comparison error:",
            error
        );


        setStatus(
            error.message ||
            "Gagal mengambil data saham.",
            "error"
        );


    } finally {

        setLoading(false);

    }

}


/* =====================================================
   ENTER KEY
===================================================== */

const stock1Input =
    document.getElementById(
        "stock1"
    );

const stock2Input =
    document.getElementById(
        "stock2"
    );


if (stock1Input) {

    stock1Input.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key ===
                "Enter"
            ) {

                if (stock2Input) {

                    stock2Input.focus();

                }

            }

        }
    );

}


if (stock2Input) {

    stock2Input.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key ===
                "Enter"
            ) {

                compareStocks();

            }

        }
    );

}


/* =====================================================
   AUTO UPPERCASE
===================================================== */

document
    .querySelectorAll(
        "#stock1, #stock2"
    )
    .forEach(
        function(input) {

            input.addEventListener(
                "input",
                function() {

                    this.value =
                        this.value.toUpperCase();

                }
            );

        }
    );


/* =====================================================
   DARK MODE
===================================================== */

const themeToggle =
    document.getElementById(
        "themeToggle"
    );


const savedTheme =
    localStorage.getItem(
        "isc-theme"
    );


if (
    savedTheme === "dark"
) {

    document.body.classList.add(
        "dark"
    );

    if (themeToggle) {

        themeToggle.textContent =
            "☀️";

    }

}


if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        function() {

            document.body.classList.toggle(
                "dark"
            );


            const isDark =
                document.body.classList.contains(
                    "dark"
                );


            localStorage.setItem(
                "isc-theme",
                isDark
                    ? "dark"
                    : "light"
            );


            themeToggle.textContent =
                isDark
                    ? "☀️"
                    : "🌙";


            /*
                Redraw chart supaya
                warna mengikuti dark mode.
            */

            const ticker1 =
                document.getElementById(
                    "stock1"
                )?.value
                ?.trim()
                ?.toUpperCase();


            const ticker2 =
                document.getElementById(
                    "stock2"
                )?.value
                ?.trim()
                ?.toUpperCase();


            if (
                ticker1 &&
                ticker2
            ) {

                /*
                    Chart akan redraw pada
                    compare berikutnya.
                */

            }

        }
    );

}


/* =====================================================
   WINDOW RESIZE
===================================================== */

let resizeTimer = null;


window.addEventListener(
    "resize",
    function() {

        clearTimeout(
            resizeTimer
        );

        resizeTimer =
            setTimeout(
                function() {

                    /*
                        Re-run comparison
                        jika data sudah pernah
                        dimuat.
                    */

                    const ticker1 =
                        document.getElementById(
                            "stock1"
                        )?.value
                        ?.trim()
                        ?.toUpperCase();

                    const ticker2 =
                        document.getElementById(
                            "stock2"
                        )?.value
                        ?.trim()
                        ?.toUpperCase();


                    if (
                        ticker1 &&
                        ticker2 &&
                        !document
                            .getElementById(
                                "result"
                            )
                            ?.classList
                            .contains(
                                "hidden"
                            )
                    ) {

                        /*
                            Tidak melakukan
                            request API baru.
                            Chart akan tetap
                            mengikuti ukuran
                            canvas pada render
                            berikutnya.
                        */

                    }

                },
                250
            );

    }
);
```
