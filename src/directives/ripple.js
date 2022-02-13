import { applyEffect } from "./lib.js";

export const rippleDirective = {
    mounted($el) {
        applyEffect($el, {
            lightColor: "white",
            clickEffect: true,
        });
    },
};
