// @ts-check

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  const errors = input.cart.lines
    .filter(line => line.merchandise.__typename === "ProductVariant")
    .filter(line => line.donationAmount?.value)
    .filter(({ quantity }) => quantity > 1)
    .map(() => ({
      localizedMessage: "You can not add more than one donation product to the cart.",
      target: "cart",
    }));

  return {
    errors
  }
};
