(() => {
    "use strict";

    // Fixed total programme fees per batch
    const FEES = {
        "2023": 92000,
        "after2023": 92000,
    };

    const var1Input = document.getElementById("var1");
    const var2Input = document.getElementById("var2");
    const resultValue = document.getElementById("result-value");
    const resultDisplay = document.getElementById("result");
    const tabs = document.querySelectorAll(".tab");
    const indicator = document.getElementById("tab-indicator");

    let currentBatch = "2023";

    function setFee(batch) {
        const fee = FEES[batch];
        var2Input.value = fee.toLocaleString("en-MY");
        calculate();
    }

    function calculate() {
        const raw = var1Input.value.trim();

        // If no input yet, show 0
        if (raw === "") {
            resultValue.textContent = "0.00";
            resultDisplay.classList.remove("negative");
            return;
        }

        const var1 = parseFloat(raw) || 0;
        const var2 = FEES[currentBatch];
        const total = var1 - var2;

        resultValue.textContent = total.toLocaleString("en-MY", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        if (total < 0) {
            resultDisplay.classList.add("negative");
        } else {
            resultDisplay.classList.remove("negative");
        }
    }

    // Live calculation on TAZU input
    var1Input.addEventListener("input", calculate);

    // Tab switching
    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            tabs.forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");

            currentBatch = tab.dataset.batch;

            if (currentBatch === "after2023") {
                indicator.classList.add("right");
            } else {
                indicator.classList.remove("right");
            }

            setFee(currentBatch);
        });
    });

    // Initialize fee display only (result stays 0)
    var2Input.value = FEES[currentBatch].toLocaleString("en-MY");
})();
