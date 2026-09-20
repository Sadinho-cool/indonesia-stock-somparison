/* =========================================================
   INDONESIA STOCK COMPARISON
   ZAPI + CLOUDFLARE WORKER
========================================================= */


/* =========================
   CONFIG
========================= */

const API_URL =
    "https://indonesia-stock-comparison.sayyid-syafiq136.workers.dev";


const TYPES = [
    "summary",
    "logo",
    "profile",
    "history",
    "dividends",
    "financial",
    "ownership"
];



/* =========================
   HELPERS
========================= */

function $(id) {
    return document.getElementById(id);
}


function cleanSymbol(value) {

    return String(value || "")
        .trim()
        .toUpperCase()
        .replace(".JK", "");

}


function formatNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === "" ||
        Number.isNaN(Number(value))
    ) {
        return "Belum tersedia";
    }

    return new Intl.NumberFormat("id-ID").format(
        Number(value)
    );

}


function formatPrice(value) {

    if (
        value === null ||
        value === undefined ||
        value === "" ||
        Number.isNaN(Number(value))
    ) {
        return "Belum tersedia";
    }

    return "Rp " + formatNumber(value);

}


function formatDate(value) {

    if (!value) {
        return "Belum tersedia";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(
        "id-ID",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).format(date);

}


function formatFileSize(bytes) {

    if (
        bytes === null ||
        bytes === undefined ||
        bytes === 0
    ) {
        return "";
    }

    const mb = bytes / 1024 / 1024;

    if (mb >= 1) {
        return `${mb.toFixed(2)} MB`;
    }

    const kb = bytes / 1024;

    return `${Math.round(kb)} KB`;

}


function setText(id, value) {

    const element = $(id);

    if (!element) {
        return;
    }

    element.textContent =
        value === null ||
        value === undefined ||
        value === ""
            ? "Belum tersedia"
            : value;

}


function safeArray(value) {

    return Array.isArray(value)
        ? value
        : [];

}



/* =========================
   API
========================= */

async function fetchType(symbol, type) {

    const url =
        `${API_URL}/?symbol=${encodeURIComponent(symbol)}&type=${encodeURIComponent(type)}`;


    const response = await fetch(url);


    if (!response.ok) {

        throw new Error(
            `${type}: HTTP ${response.status}`
        );

    }


    const json = await response.json();


    if (
        json &&
        json.error
    ) {

        throw new Error(
            `${type}: ${json.error}`
        );

    }


    return json;

}


async function loadStock(symbol) {

    const results = {};

    const requests =
        TYPES.map(async (type) => {

            try {

                results[type] =
                    await fetchType(symbol, type);

            }
            catch (error) {

                console.warn(
                    `${symbol} ${type} gagal:`,
                    error
                );

                results[type] = {
                    __error: true,
                    message: error.message
                };

            }

        });


    await Promise.all(requests);


    return results;

}



/* =========================
   SUMMARY
========================= */

function renderSummary(
    summary,
    index,
    symbol
) {

    const suffix =
        index + 1;


    const data =
        summary &&
        !summary.__error
            ? summary
            : {};


    setText(
        `name${suffix}`,
        data.name || symbol
    );


    setText(
        `ticker${suffix}`,
        data.symbol || symbol
    );


    setText(
        `price${suffix}`,
        formatPrice(data.price)
    );


    /*
        Zapi summary belum memberikan
        Dividend Yield / PER / PBV.
        Jadi jangan mengarang angka.
    */

    setText(
        `dividend${suffix}`,
        "Belum tersedia"
    );


    setText(
        `per${suffix}`,
        "Belum tersedia"
    );


    setText(
        `pbv${suffix}`,
        "Belum tersedia"
    );


    setText(
        `tableTicker${suffix}`,
        data.symbol || symbol
    );


    setText(
        `tablePrice${suffix}`,
        formatPrice(data.price)
    );


    setText(
        `tableDividend${suffix}`,
        "Belum tersedia"
    );


    setText(
        `tablePer${suffix}`,
        "Belum tersedia"
    );


    setText(
        `tablePbv${suffix}`,
        "Belum tersedia"
    );


    setText(
        `marketTitle${suffix}`,
        data.symbol || symbol
    );


    setText(
        `open${suffix}`,
        formatPrice(data.open)
    );


    setText(
        `high${suffix}`,
        formatPrice(data.high)
    );


    setText(
        `low${suffix}`,
        formatPrice(data.low)
    );


    setText(
        `volume${suffix}`,
        formatNumber(data.volume)
    );


    setText(
        `value${suffix}`,
        formatPrice(data.value)
    );


    setText(
        `frequency${suffix}`,
        formatNumber(data.frequency)
    );


    setText(
        `bid${suffix}`,
        formatPrice(data.bid)
    );


    setText(
        `offer${suffix}`,
        formatPrice(data.offer)
    );


    setText(
        `foreignBuy${suffix}`,
        formatNumber(data.foreignBuy)
    );


    setText(
        `foreignSell${suffix}`,
        formatNumber(data.foreignSell)
    );


    setText(
        `tableVolume${suffix}`,
        formatNumber(data.volume)
    );


    setText(
        `tableForeignBuy${suffix}`,
        formatNumber(data.foreignBuy)
    );


    setText(
        `tableForeignSell${suffix}`,
        formatNumber(data.foreignSell)
    );

}



/* =========================
   PROFILE
========================= */

function renderProfile(
    response,
    index,
    symbol
) {

    const suffix =
        index + 1;


    const profile =
        response &&
        !response.__error &&
        response.data
            ? response.data
            : null;


    if (!profile) {

        setText(
            `profileName${suffix}`,
            symbol
        );

        setText(
            `profileTicker${suffix}`,
            symbol
        );

        return;

    }


    setText(
        `profileName${suffix}`,
        profile.name || symbol
    );


    setText(
        `profileTicker${suffix}`,
        profile.code || symbol
    );


    setText(
        `sector${suffix}`,
        profile.sector
    );


    setText(
        `industry${suffix}`,
        profile.industry
    );


    /*
        Zapi profile yang kita cek
        tidak memiliki field employees.
    */

    setText(
        `employees${suffix}`,
        "Belum tersedia"
    );


    setText(
        `listingDate${suffix}`,
        formatDate(profile.listingDate)
    );


    setText(
        `listingBoard${suffix}`,
        profile.listingBoard
    );


    setText(
        `description${suffix}`,
        profile.mainBusiness
    );


    renderWebsite(
        `website${suffix}`,
        profile.website
    );


    renderLogo(
        `profileLogo${suffix}`,
        profile.logo,
        symbol
    );


    renderLogo(
        `logo${suffix}`,
        profile.logo,
        symbol
    );

}



/* =========================
   WEBSITE
========================= */

function renderWebsite(id, website) {

    const element = $(id);

    if (!element) {
        return;
    }


    element.replaceChildren();


    if (!website) {

        element.textContent =
            "Belum tersedia";

        return;

    }


    let href =
        String(website).trim();


    if (
        !href.startsWith("http://") &&
        !href.startsWith("https://")
    ) {

        href =
            "https://" + href;

    }


    const link =
        document.createElement("a");


    link.href = href;

    link.target = "_blank";

    link.rel = "noopener noreferrer";

    link.textContent =
        website;


    link.className =
        "document-link";


    element.appendChild(link);

}



/* =========================
   LOGO
========================= */

function renderLogo(id, logoUrl, symbol) {

    const container = $(id);

    if (!container) {
        return;
    }

    container.replaceChildren();

    if (!logoUrl) {
        container.textContent =
            String(symbol || "?").substring(0, 1).toUpperCase();

        return;
    }

    const image = document.createElement("img");

    image.src = logoUrl;

    image.alt = `${symbol} company logo`;

    image.loading = "eager";

    image.onerror = () => {

        image.remove();

        container.textContent =
            String(symbol || "?").substring(0, 1).toUpperCase();

    };

    container.appendChild(image);
}



/* =========================
   DIVIDENDS
========================= */

function renderDividends(
    dividendResponse,
    profileResponse,
    index,
    symbol
) {

    const suffix = index + 1;

    const title =
        $(`dividendTitle${suffix}`);

    if (title) {
        title.textContent = symbol;
    }


    /*
        Profile dividends digunakan sebagai
        sumber utama karena lebih lengkap.
    */

    let dividends = [];


    if (
        profileResponse &&
        !profileResponse.__error &&
        profileResponse.data
    ) {

        dividends =
            safeArray(
                profileResponse.data.dividends
            );

    }


    if (
        dividends.length === 0 &&
        dividendResponse &&
        !dividendResponse.__error &&
        dividendResponse.data
    ) {

        dividends =
            safeArray(
                dividendResponse.data.items
            );

    }


    const list =
        $(`dividendList${suffix}`);


    if (!list) {
        return;
    }


    list.replaceChildren();


    if (dividends.length === 0) {

        list.appendChild(
            createEmptyState(
                "Belum ada data dividen pada response yang tersedia."
            )
        );

        return;

    }


    dividends
        .slice(0, 10)
        .forEach((dividend) => {

            const item =
                document.createElement("div");

            item.className =
                "document-item";


            const info =
                document.createElement("div");

            info.className =
                "document-info";


            const name =
                document.createElement("span");

            name.className =
                "document-name";


            name.textContent =
                `Tahun buku ${dividend.bookYear || "-"}`;


            const meta =
                document.createElement("span");

            meta.className =
                "document-meta";


            meta.textContent =
                `Cash per Share: ${
                    dividend.cashPerShare ?? "Belum tersedia"
                } • Cum: ${
                    formatDate(dividend.cumDate)
                } • Ex: ${
                    formatDate(dividend.exDate)
                }`;


            info.appendChild(name);
            info.appendChild(meta);


            item.appendChild(info);


            /*
                Beberapa response mungkin memiliki
                URL dokumen. Kita hanya membuat tombol
                jika URL benar-benar diberikan API.
            */

            const url =
    dividend.url ||
    dividend.URL ||
    dividend.fileUrl ||
    dividend.fileURL ||
    dividend.documentUrl ||
    dividend.documentURL ||
    (
        profileResponse &&
        profileResponse.data &&
        profileResponse.data._dividendSourceUrl
    );


            if (url) {

                const link =
                    document.createElement("a");

                link.className =
                    "document-link";

                link.href = url;

                link.target = "_blank";

                link.rel =
                    "noopener noreferrer";

                link.textContent =
                    "Buka Dokumen ↗";


                item.appendChild(link);

            }


            list.appendChild(item);

        });

}



/* =========================
   FINANCIAL
========================= */

function renderFinancial(
    response,
    index,
    symbol
) {

    const suffix =
        index + 1;


    setText(
        `reportTitle${suffix}`,
        `${symbol} — Financial Report`
    );


    const list =
        $(`financialList${suffix}`);


    if (!list) {
        return;
    }


    list.replaceChildren();


    if (
        !response ||
        response.__error ||
        !response.data ||
        !Array.isArray(response.data.data)
    ) {

        list.appendChild(
            createEmptyState(
                "Dokumen laporan keuangan tidak tersedia."
            )
        );

        return;

    }


    const reports =
        response.data.data;


    const documents = [];


    reports.forEach((report) => {

        safeArray(
            report.Attachments
        ).forEach((attachment) => {

            documents.push({
                report,
                attachment
            });

        });

    });


    if (documents.length === 0) {

        list.appendChild(
            createEmptyState(
                "Belum ada attachment laporan keuangan."
            )
        );

        return;

    }


    documents
        .slice(0, 10)
        .forEach(({ report, attachment }) => {

            const item =
                document.createElement("div");

            item.className =
                "document-item";


            const info =
                document.createElement("div");

            info.className =
                "document-info";


            const name =
                document.createElement("span");

            name.className =
                "document-name";


            const fileName =
                attachment.File_Name ||
                attachment.fileName ||
                attachment.FileName ||
                "Financial document";


            name.textContent =
                fileName;


            const meta =
                document.createElement("span");

            meta.className =
                "document-meta";


            const year =
                report.Year ||
                report.year ||
                2024;


            const period =
                report.Period ||
                report.period ||
                "audit";


            const size =
                formatFileSize(
                    attachment.File_Size ??
                    attachment.fileSize ??
                    0
                );


            meta.textContent =
                `${year} • ${period}${
                    size
                        ? " • " + size
                        : ""
                }`;


            info.appendChild(name);
            info.appendChild(meta);


            item.appendChild(info);


            /*
                Cari URL yang benar-benar diberikan
                oleh API.

                Kita TIDAK menebak URL IDX.
            */

            const url =
                attachment.url ||
                attachment.URL ||
                attachment.File_URL ||
                attachment.File_Url ||
                attachment.fileUrl ||
                attachment.fileURL ||
                attachment.Download_URL ||
                attachment.Download_Url ||
                attachment.downloadUrl ||
                attachment.DownloadURL;


            if (url) {

                const link =
                    document.createElement("a");

                link.className =
                    "document-link";

                link.href =
                    url;

                link.target =
                    "_blank";

                link.rel =
                    "noopener noreferrer";

                link.textContent =
                    "Buka File ↗";


                item.appendChild(link);

            }


            list.appendChild(item);

        });

}


/* =========================
   OWNERSHIP
========================= */

function renderOwnership(
    response,
    index,
    symbol
) {

    const suffix =
        index + 1;


    setText(
        `ownershipTitle${suffix}`,
        symbol
    );


    const list =
        $(`ownershipList${suffix}`);


    if (!list) {
        return;
    }


    list.replaceChildren();


    if (
        !response ||
        response.__error ||
        !response.data ||
        !Array.isArray(response.data.data)
    ) {

        list.appendChild(
            createEmptyState(
                "Dokumen ownership tidak tersedia."
            )
        );

        return;

    }


    const files =
        response.data.data;


    if (files.length === 0) {

        list.appendChild(
            createEmptyState(
                "Belum ada dokumen ownership."
            )
        );

        return;

    }


    files
        .slice(0, 10)
        .forEach((file) => {

            const item =
                document.createElement("div");

            item.className =
                "document-item";


            const info =
                document.createElement("div");

            info.className =
                "document-info";


            const name =
                document.createElement("span");

            name.className =
                "document-name";


            name.textContent =
                file.fileName ||
                "Ownership file";


            const meta =
                document.createElement("span");

            meta.className =
                "document-meta";


            meta.textContent =
                `${
                    file.categoryLabel ||
                    file.category ||
                    "Ownership"
                } • ${
                    formatDate(file.publishedAt)
                }`;


            info.appendChild(name);

            info.appendChild(meta);


            item.appendChild(info);


            if (file.url) {

                const link =
                    document.createElement("a");


                link.href =
                    file.url;


                link.target =
                    "_blank";


                link.rel =
                    "noopener noreferrer";


                link.className =
                    "document-link";


                link.textContent =
                    "Buka";


                item.appendChild(link);

            }


            list.appendChild(item);

        });

}



/* =========================
   EMPTY STATE
========================= */

function createEmptyState(message) {

    const element =
        document.createElement("div");


    element.className =
        "empty-state";


    element.textContent =
        message;


    return element;

}



/* =========================
   HISTORY / CHART
========================= */

function extractHistory(response) {

    if (
        !response ||
        response.__error ||
        !response.data
    ) {

        return [];

    }


    return safeArray(
        response.data.items
    );

}


function drawPriceChart(
    history1,
    history2,
    symbol1,
    symbol2
) {

    const canvas =
        $("priceChart");


    if (!canvas) {
        return;
    }


    const container =
        canvas.parentElement;


    const rect =
        container.getBoundingClientRect();


    const dpr =
        window.devicePixelRatio || 1;


    const width =
        Math.max(rect.width, 300);


    const height =
        Math.max(rect.height, 240);


    canvas.width =
        width * dpr;


    canvas.height =
        height * dpr;


    canvas.style.width =
        width + "px";


    canvas.style.height =
        height + "px";


    const ctx =
        canvas.getContext("2d");


    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    /*
        Sort oldest -> newest
    */

    const first =
        [...history1]
            .filter(
                item =>
                    item &&
                    item.date &&
                    Number.isFinite(
                        Number(item.close)
                    )
            )
            .sort(
                (a, b) =>
                    new Date(a.date) -
                    new Date(b.date)
            );


    const second =
        [...history2]
            .filter(
                item =>
                    item &&
                    item.date &&
                    Number.isFinite(
                        Number(item.close)
                    )
            )
            .sort(
                (a, b) =>
                    new Date(a.date) -
                    new Date(b.date)
            );


    const all =
        [...first, ...second];


    if (all.length === 0) {

        drawChartMessage(
            ctx,
            width,
            height,
            "Data harga belum tersedia."
        );

        return;

    }


    const values =
        all.map(
            item =>
                Number(item.close)
        );


    let min =
        Math.min(...values);


    let max =
        Math.max(...values);


    if (min === max) {

        min -= 1;

        max += 1;

    }


    const padding = {
        top: 30,
        right: 25,
        bottom: 45,
        left: 60
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
        getComputedStyle(document.body);


    const primary =
        styles
            .getPropertyValue("--primary")
            .trim() ||
        "#2563eb";


    const accent =
        styles
            .getPropertyValue("--accent")
            .trim() ||
        "#7c3aed";


    const border =
        styles
            .getPropertyValue("--border")
            .trim() ||
        "#e2e8f0";


    const muted =
        styles
            .getPropertyValue("--text-muted")
            .trim() ||
        "#94a3b8";


    const text =
        styles
            .getPropertyValue("--text-secondary")
            .trim() ||
        "#475569";


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    /*
        Grid
    */

    ctx.lineWidth = 1;

    ctx.strokeStyle =
        border;


    const gridLines = 5;


    for (
        let i = 0;
        i <= gridLines;
        i++
    ) {

        const y =
            padding.top +
            (
                chartHeight /
                gridLines
            ) * i;


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
            max -
            (
                (max - min) /
                gridLines
            ) * i;


        ctx.fillStyle =
            muted;


        ctx.font =
            "10px system-ui";


        ctx.textAlign =
            "right";


        ctx.fillText(
            formatNumber(
                Math.round(value)
            ),
            padding.left - 8,
            y + 4
        );

    }


    /*
        Combine dates.
    */

    const dates =
        [
            ...new Set(
                [
                    ...first,
                    ...second
                ].map(
                    item =>
                        item.date
                )
            )
        ].sort(
            (a, b) =>
                new Date(a) -
                new Date(b)
        );


    function xForDate(date) {

        if (dates.length <= 1) {

            return padding.left +
                chartWidth / 2;

        }


        const index =
            dates.indexOf(date);


        return padding.left +
            (
                index /
                (dates.length - 1)
            ) *
            chartWidth;

    }


    function yForValue(value) {

        return padding.top +
            (
                (max - value) /
                (max - min)
            ) *
            chartHeight;

    }


    function drawLine(
        items,
        color
    ) {

        if (items.length === 0) {
            return;
        }


        ctx.beginPath();


        items.forEach(
            (item, index) => {

                const x =
                    xForDate(
                        item.date
                    );


                const y =
                    yForValue(
                        Number(
                            item.close
                        )
                    );


                if (index === 0) {

                    ctx.moveTo(
                        x,
                        y
                    );

                }
                else {

                    ctx.lineTo(
                        x,
                        y
                    );

                }

            }
        );


        ctx.strokeStyle =
            color;


        ctx.lineWidth = 2.5;

        ctx.lineJoin =
            "round";

        ctx.lineCap =
            "round";


        ctx.stroke();


        /*
            Last point
        */

        const last =
            items[
                items.length - 1
            ];


        const lx =
            xForDate(
                last.date
            );


        const ly =
            yForValue(
                Number(last.close)
            );


        ctx.beginPath();

        ctx.arc(
            lx,
            ly,
            4,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            color;


        ctx.fill();

    }


    drawLine(
        first,
        primary
    );


    drawLine(
        second,
        accent
    );


    /*
        Date labels
    */

    ctx.fillStyle =
        text;


    ctx.font =
        "10px system-ui";


    ctx.textAlign =
        "center";


    const labelIndexes =
        dates.length <= 4
            ? dates.map(
                (_, i) => i
            )
            : [
                0,
                Math.floor(
                    dates.length / 2
                ),
                dates.length - 1
            ];


    labelIndexes.forEach(
        index => {

            const date =
                dates[index];


            const x =
                xForDate(date);


            ctx.fillText(
                formatShortDate(date),
                x,
                height - 15
            );

        }
    );

}


function formatShortDate(value) {

    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return new Intl.DateTimeFormat(
        "id-ID",
        {
            day: "2-digit",
            month: "short"
        }
    ).format(date);

}


function drawChartMessage(
    ctx,
    width,
    height,
    message
) {

    const styles =
        getComputedStyle(document.body);


    const muted =
        styles
            .getPropertyValue("--text-muted")
            .trim() ||
        "#94a3b8";


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    ctx.fillStyle =
        muted;


    ctx.font =
        "13px system-ui";


    ctx.textAlign =
        "center";


    ctx.fillText(
        message,
        width / 2,
        height / 2
    );

}



/* =========================
   SHOW SECTIONS
========================= */

function showResults() {

    $("result")
        ?.classList
        .remove("hidden");


    $("comparison")
        ?.classList
        .remove("hidden");


    $("marketSection")
        ?.classList
        .remove("hidden");


    $("chartSection")
        ?.classList
        .remove("hidden");


    $("dividendSection")
        ?.classList
        .remove("hidden");


    $("profileSection")
        ?.classList
        .remove("hidden");


    $("financialSection")
        ?.classList
        .remove("hidden");


    $("ownershipSection")
        ?.classList
        .remove("hidden");

}



/* =========================
   MAIN COMPARE
========================= */

async function compareStocks() {

    const stock1 =
        cleanSymbol(
            $("stock1")?.value
        );


    const stock2 =
        cleanSymbol(
            $("stock2")?.value
        );


    const status =
        $("status");


    const button =
        $("compareButton");


    const buttonText =
        $("buttonText");


    /*
        Validation
    */

    if (!stock1 || !stock2) {

        if (status) {

            status.className =
                "status error";

            status.textContent =
                "Masukkan dua kode saham terlebih dahulu.";

        }

        return;

    }


    if (stock1 === stock2) {

        if (status) {

            status.className =
                "status error";

            status.textContent =
                "Pilih dua saham yang berbeda.";

        }

        return;

    }


    /*
        Loading
    */

    if (button) {
        button.disabled = true;
    }


    if (buttonText) {

        buttonText.textContent =
            "Memuat data...";

    }


    if (status) {

        status.className =
            "status loading";

        status.textContent =
            "Mengambil data dari IDX...";

    }


    try {

        /*
            Load dua saham bersamaan.
        */

        const [
            stockData1,
            stockData2
        ] = await Promise.all([
            loadStock(stock1),
            loadStock(stock2)
        ]);


        /*
            Render
        */

        renderSummary(
            stockData1.summary,
            0,
            stock1
        );


        renderSummary(
            stockData2.summary,
            1,
            stock2
        );


        renderProfile(
            stockData1.profile,
            0,
            stock1
        );


        renderProfile(
            stockData2.profile,
            1,
            stock2
        );


        renderDividends(
            stockData1.dividends,
            stockData1.profile,
            0,
            stock1
        );


        renderDividends(
            stockData2.dividends,
            stockData2.profile,
            1,
            stock2
        );


        renderFinancial(
            stockData1.financial,
            0,
            stock1
        );


        renderFinancial(
            stockData2.financial,
            1,
            stock2
        );


        renderOwnership(
            stockData1.ownership,
            0,
            stock1
        );


        renderOwnership(
            stockData2.ownership,
            1,
            stock2
        );


        /*
            History
        */

        const history1 =
            extractHistory(
                stockData1.history
            );


        const history2 =
            extractHistory(
                stockData2.history
            );


        setText(
            "chartLegend1",
            stock1
        );


        setText(
            "chartLegend2",
            stock2
        );


        setText(
            "chartSubtitle",
            `Riwayat harga ${
                stock1
            } dan ${
                stock2
            } dari data yang tersedia.`
        );


        drawPriceChart(
            history1,
            history2,
            stock1,
            stock2
        );


        /*
            Show everything
        */

        showResults();


        /*
            Success
        */

        if (status) {

            status.className =
                "status success";

            status.textContent =
                "Data berhasil diperbarui.";

        }


        /*
            Scroll smoothly to result
        */

        setTimeout(() => {

            $("result")?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 150);


    }
    catch (error) {

        console.error(error);


        if (status) {

            status.className =
                "status error";

            status.textContent =
                "Terjadi kesalahan saat mengambil data.";

        }

    }
    finally {

        if (button) {
            button.disabled = false;
        }


        if (buttonText) {

            buttonText.textContent =
                "Bandingkan Saham";

        }

    }

}



/* =========================
   DARK MODE
========================= */

function setupTheme() {

    const toggle =
        $("themeToggle");


    if (!toggle) {
        return;
    }


    const savedTheme =
        localStorage.getItem(
            "isc-theme"
        );


    if (savedTheme === "dark") {

        document.body.classList.add(
            "dark"
        );

        toggle.textContent =
            "☀️";

    }
    else {

        toggle.textContent =
            "🌙";

    }


    toggle.addEventListener(
        "click",
        () => {

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


            toggle.textContent =
                isDark
                    ? "☀️"
                    : "🌙";


            /*
                Redraw chart karena
                warna CSS berubah.
            */

            const canvas =
                $("priceChart");


            if (
                canvas &&
                !$("chartSection")
                    ?.classList
                    .contains("hidden")
            ) {

                /*
                    Ambil data yang tersimpan.
                    draw terakhir ditangani oleh
                    compareStocks.
                */

                redrawCurrentChart();

            }

        }
    );

}



/* =========================
   CHART CACHE
========================= */

let currentChartData = null;


function redrawCurrentChart() {

    if (!currentChartData) {
        return;
    }


    drawPriceChart(
        currentChartData.history1,
        currentChartData.history2,
        currentChartData.symbol1,
        currentChartData.symbol2
    );

}



/*
    Simpan history untuk dark-mode redraw.
    Kita bungkus drawPriceChart asli.
*/

const originalDrawPriceChart =
    drawPriceChart;


drawPriceChart =
    function (
        history1,
        history2,
        symbol1,
        symbol2
    ) {

        currentChartData = {
            history1,
            history2,
            symbol1,
            symbol2
        };


        originalDrawPriceChart(
            history1,
            history2,
            symbol1,
            symbol2
        );

    };



/* =========================
   ENTER KEY
========================= */

function setupInputs() {

    const stock1 = $("stock1");
    const stock2 = $("stock2");

    if (stock1) {

        stock1.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    if (stock1.value.trim()) {

                        stock2?.focus();

                    }

                }

            }
        );

    }

    if (stock2) {

        stock2.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    compareStocks();

                }

            }
        );

    }

}



/* =========================
   INITIALIZE
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupTheme();

        setupInputs();

       setupInfoToggle();

    }
);



/* =========================
   INFO TOGGLE
========================= */

function setupInfoToggle() {

    const button = $("infoToggle");
    const details = $("infoDetails");

    if (!button || !details) return;

    button.addEventListener("click", () => {

        const isOpen =
            button.getAttribute("aria-expanded") === "true";

        button.setAttribute(
            "aria-expanded",
            String(!isOpen)
        );

        button.classList.toggle(
            "active",
            !isOpen
        );

        details.hidden = isOpen;

    });

}
