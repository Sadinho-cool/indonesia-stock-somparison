const API_URL =
    "https://indonesia-stock-comparison.sayyid-syafiq136.workers.dev";


/* =====================================================
   FORMATTERS
===================================================== */

function formatRupiah(number) {

    if (
        number === null ||
        number === undefined ||
        number === ""
    ) {
        return "Data tidak tersedia";
    }

    return "Rp " +
        Number(number).toLocaleString("id-ID");
}


function formatNumber(number) {

    if (
        number === null ||
        number === undefined ||
        number === ""
    ) {
        return "Data tidak tersedia";
    }

    return Number(number).toLocaleString("id-ID");
}


function formatPercent(number) {

    if (
        number === null ||
        number === undefined ||
        number === ""
    ) {
        return "Data tidak tersedia";
    }

    return Number(number).toFixed(2) + "%";
}


function formatChange(number) {

    if (
        number === null ||
        number === undefined
    ) {
        return "Data tidak tersedia";
    }

    const value = Number(number);

    if (value > 0) {
        return "+" + value.toLocaleString("id-ID");
    }

    return value.toLocaleString("id-ID");
}


/* =====================================================
   API
===================================================== */

async function getStockData(ticker) {

    const response = await fetch(
        `${API_URL}/?symbol=${encodeURIComponent(ticker)}&type=summary`
    );

    const data = await response.json();

    if (!response.ok || data.error) {

        throw new Error(
            data.error ||
            "Gagal mengambil data saham."
        );
    }

    return data;
}


/* =====================================================
   UI HELPERS
===================================================== */

function setStatus(
    message,
    type = ""
) {

    const status =
        document.getElementById("status");

    if (!status) return;

    status.textContent = message;

    status.className = "status";

    if (type) {
        status.classList.add(type);
    }
}


function setLoading(isLoading) {

    const button =
        document.getElementById("compareButton");

    const buttonText =
        document.getElementById("buttonText");

    if (!button || !buttonText) return;

    if (isLoading) {

        button.disabled = true;

        button.style.opacity = "0.7";

        buttonText.textContent =
            "Mengambil data...";

    } else {

        button.disabled = false;

        button.style.opacity = "1";

        buttonText.textContent =
            "Bandingkan Saham";
    }
}


function getTickerLogo(symbol) {

    if (!symbol) {
        return "?";
    }

    return symbol
        .replace(".JK", "")
        .substring(0, 2);
}


/* =====================================================
   APPLY STOCK DATA
===================================================== */

function displayStock(
    stock,
    number
) {

    const suffix =
        number === 1 ? "1" : "2";


    /* ================================================
       BASIC INFORMATION
    ================================================ */

    const name =
        document.getElementById(
            `name${suffix}`
        );

    const ticker =
        document.getElementById(
            `ticker${suffix}`
        );

    const logo =
        document.getElementById(
            `logo${suffix}`
        );

    const price =
        document.getElementById(
            `price${suffix}`
        );


    if (name) {

        name.textContent =
            stock.name ||
            "Unknown Company";

    }


    if (ticker) {

        ticker.textContent =
            stock.symbol || "---";

    }


    if (logo) {

        logo.textContent =
            getTickerLogo(
                stock.symbol
            );

    }


    if (price) {

        price.textContent =
            formatRupiah(
                stock.price
            );

    }


    /* ================================================
       CHANGE
    ================================================ */

    const changeElement =
        document.getElementById(
            `change${suffix}`
        );


    if (changeElement) {

        const change =
            stock.change ?? null;

        const percent =
            stock.changePercent ?? null;


        if (
            change === null ||
            percent === null
        ) {

            changeElement.textContent =
                "Data tidak tersedia";

        } else {

            const sign =
                change > 0
                    ? "+"
                    : "";

            changeElement.textContent =
                `${sign}${formatRupiah(change)} (${sign}${formatPercent(percent)})`;

            changeElement.classList.remove(
                "positive",
                "negative"
            );


            if (change > 0) {

                changeElement.classList.add(
                    "positive"
                );

            } else if (change < 0) {

                changeElement.classList.add(
                    "negative"
                );

            }

        }

    }


    /* ================================================
       EXTRA TRADING DATA
    ================================================ */

    const volume =
        document.getElementById(
            `volume${suffix}`
        );

    const value =
        document.getElementById(
            `value${suffix}`
        );

    const frequency =
        document.getElementById(
            `frequency${suffix}`
        );

    const high =
        document.getElementById(
            `high${suffix}`
        );

    const low =
        document.getElementById(
            `low${suffix}`
        );


    if (volume) {

        volume.textContent =
            formatNumber(
                stock.volume
            );

    }


    if (value) {

        value.textContent =
            formatRupiah(
                stock.value
            );

    }


    if (frequency) {

        frequency.textContent =
            formatNumber(
                stock.frequency
            );

    }


    if (high) {

        high.textContent =
            formatRupiah(
                stock.high
            );

    }


    if (low) {

        low.textContent =
            formatRupiah(
                stock.low
            );

    }


    /* ================================================
       BID / OFFER
    ================================================ */

    const bid =
        document.getElementById(
            `bid${suffix}`
        );

    const offer =
        document.getElementById(
            `offer${suffix}`
        );


    if (bid) {

        bid.textContent =
            formatRupiah(
                stock.bid
            );

    }


    if (offer) {

        offer.textContent =
            formatRupiah(
                stock.offer
            );

    }


    /* ================================================
       FOREIGN FLOW
    ================================================ */

    const foreignBuy =
        document.getElementById(
            `foreignBuy${suffix}`
        );

    const foreignSell =
        document.getElementById(
            `foreignSell${suffix}`
        );


    if (foreignBuy) {

        foreignBuy.textContent =
            formatNumber(
                stock.foreignBuy
            );

    }


    if (foreignSell) {

        foreignSell.textContent =
            formatNumber(
                stock.foreignSell
            );

    }


    /* ================================================
       OLD V1 METRICS
       Fundamental belum tersedia
    ================================================ */

    const dividend =
        document.getElementById(
            `dividend${suffix}`
        );

    const per =
        document.getElementById(
            `per${suffix}`
        );

    const pbv =
        document.getElementById(
            `pbv${suffix}`
        );


    if (dividend) {

        dividend.textContent =
            "Belum tersedia";

    }


    if (per) {

        per.textContent =
            "Belum tersedia";

    }


    if (pbv) {

        pbv.textContent =
            "Belum tersedia";

    }

}


/* =====================================================
   COMPARE STOCKS
===================================================== */

async function compareStocks() {

    const ticker1 =
        document
            .getElementById("stock1")
            .value
            .toUpperCase()
            .trim();


    const ticker2 =
        document
            .getElementById("stock2")
            .value
            .toUpperCase()
            .trim();


    /* ================================================
       VALIDATION
    ================================================ */

    if (!ticker1 || !ticker2) {

        setStatus(
            "Masukkan dua ticker saham terlebih dahulu.",
            "error"
        );

        return;
    }


    if (ticker1 === ticker2) {

        setStatus(
            "Pilih dua saham yang berbeda untuk dibandingkan.",
            "error"
        );

        return;
    }


    setLoading(true);

    setStatus(
        "Mengambil data saham...",
        "loading"
    );


    try {

        const [
            stock1,
            stock2
        ] = await Promise.all([

            getStockData(ticker1),

            getStockData(ticker2)

        ]);


        /* ============================================
           SHOW RESULT
        ============================================ */

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


        /* ============================================
           DISPLAY STOCKS
        ============================================ */

        displayStock(
            stock1,
            1
        );


        displayStock(
            stock2,
            2
        );


        /* ============================================
           COMPARISON TABLE
        ============================================ */

        const tableTicker1 =
            document.getElementById(
                "tableTicker1"
            );

        const tableTicker2 =
            document.getElementById(
                "tableTicker2"
            );


        const tablePrice1 =
            document.getElementById(
                "tablePrice1"
            );

        const tablePrice2 =
            document.getElementById(
                "tablePrice2"
            );


        if (tableTicker1) {

            tableTicker1.textContent =
                stock1.symbol;

        }


        if (tableTicker2) {

            tableTicker2.textContent =
                stock2.symbol;

        }


        if (tablePrice1) {

            tablePrice1.textContent =
                formatRupiah(
                    stock1.price
                );

        }


        if (tablePrice2) {

            tablePrice2.textContent =
                formatRupiah(
                    stock2.price
                );

        }


        /* ============================================
           V1 FUNDAMENTAL PLACEHOLDERS
        ============================================ */

        [
            "Dividend",
            "Per",
            "Pbv"
        ].forEach(metric => {

            const element1 =
                document.getElementById(
                    `table${metric}1`
                );

            const element2 =
                document.getElementById(
                    `table${metric}2`
                );


            if (element1) {

                element1.textContent =
                    "Belum tersedia";

            }


            if (element2) {

                element2.textContent =
                    "Belum tersedia";

            }

        });


        /* ============================================
           SUCCESS
        ============================================ */

        setStatus(
            `Perbandingan ${stock1.symbol} vs ${stock2.symbol} berhasil dibuat.`,
            "success"
        );


        /* ============================================
           SCROLL
        ============================================ */

        if (result) {

            result.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }


    } catch (error) {

        console.error(error);

        setStatus(
            "Gagal mengambil data. Pastikan ticker benar dan coba lagi.",
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

            if (event.key === "Enter") {

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

            if (event.key === "Enter") {

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
    .forEach(function(input) {

        input.addEventListener(
            "input",
            function() {

                this.value =
                    this.value.toUpperCase();

            }
        );

    });


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
    savedTheme === "dark" &&
    themeToggle
) {

    document.body.classList.add(
        "dark"
    );

    themeToggle.textContent =
        "☀️";

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

        }
    );

}
