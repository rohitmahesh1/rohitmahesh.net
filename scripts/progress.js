(() => {
    if (window.matchMedia && !window.matchMedia("(min-width: 901px)").matches) {
        return;
    }

    const storageKey = "rule110-reveal-v1";
    const revealDelay = 360;
    const revealDuration = 14972;
    const revealTotal = revealDelay + revealDuration;
    const root = document.documentElement;
    let pageStartedAt = 0;
    let startElapsed = 0;
    let revealTimer = 0;
    let isRunning = false;

    const updateReplayPosition = () => {
        const replay = document.querySelector(".rule110-replay--desktop");
        const stage = document.querySelector(".rule110-wall--desktop .rule110-wall__stage");

        if (!replay || !stage) {
            return;
        }

        const stageRect = stage.getBoundingClientRect();

        root.style.setProperty("--rule110-replay-left", `${stageRect.left + stageRect.width / 2 + window.scrollX}px`);
        root.style.setProperty("--rule110-replay-top", `${stageRect.bottom + window.scrollY + 18}px`);
    };

    const markComplete = () => {
        localStorage.setItem(storageKey, JSON.stringify({
            elapsed: revealTotal,
            done: true,
        }));
        updateReplayPosition();
        root.classList.add("rule110-reveal-complete");
        isRunning = false;
    };

    const save = () => {
        if (!isRunning) {
            return;
        }

        const elapsed = Math.min(revealTotal, startElapsed + performance.now() - pageStartedAt);

        localStorage.setItem(storageKey, JSON.stringify({
            elapsed,
            done: elapsed >= revealTotal,
        }));
    };

    const startReveal = (elapsed) => {
        window.clearTimeout(revealTimer);
        startElapsed = Math.min(elapsed, revealTotal);

        if (startElapsed >= revealTotal) {
            markComplete();
            return;
        }

        pageStartedAt = performance.now();
        isRunning = true;
        root.style.setProperty("--rule110-elapsed", `${startElapsed}ms`);
        revealTimer = window.setTimeout(markComplete, revealTotal - startElapsed);
    };

    const restartAnimation = () => {
        const patterns = document.querySelectorAll(".rule110-wall__pattern");

        patterns.forEach((pattern) => {
            pattern.style.animation = "none";
        });

        void document.body.offsetHeight;

        patterns.forEach((pattern) => {
            pattern.style.animation = "";
        });
    };

    const attachReplay = () => {
        const replayButtons = document.querySelectorAll("[data-rule110-replay]");

        if (replayButtons.length === 0) {
            return;
        }

        const replay = () => {
            localStorage.removeItem(storageKey);
            root.classList.remove("rule110-reveal-complete");
            root.style.setProperty("--rule110-elapsed", "0ms");
            restartAnimation();
            startReveal(0);
        };

        replayButtons.forEach((button) => {
            button.addEventListener("click", replay);
        });

        updateReplayPosition();
    };

    try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");

        if (saved.done) {
            root.classList.add("rule110-reveal-complete");
        } else {
            startReveal(Number(saved.elapsed) || 0);
        }
    } catch {
        root.style.removeProperty("--rule110-elapsed");
    }

    window.addEventListener("pagehide", save);
    window.addEventListener("DOMContentLoaded", attachReplay);
    window.addEventListener("load", updateReplayPosition);
    window.addEventListener("resize", updateReplayPosition);
})();
