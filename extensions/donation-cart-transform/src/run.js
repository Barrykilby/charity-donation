// @ts-check

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @type {FunctionRunResult}
 */
const NO_CHANGES = {
  operations: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {


  const donationProduct = input.cart.lines
    .filter(line => line.merchandise.__typename === "ProductVariant")
    .filter(line => line.donationAmount?.value)
    .map(line => {
      const variant = /** @type {ProductVariant} */ (line.merchandise);

      return {
        lineId: line.id,
        variantId: variant.id,
        donationAmount: parseInt(line.donationAmount.value),
      }
    }).reduce((lowest, line) => {
      return (lowest.donationAmount < line.donationAmount) ? lowest : line;
    }, { donationAmount: Infinity });

  // Just for debugging
  // console.error("Donation amount:", donationProduct.donationAmount);

  if (!donationProduct) {
    return NO_CHANGES;
  }

  if (donationProduct.donationAmount == Infinity) {
    return NO_CHANGES;
  }

  const update = {
    update: {
      cartLineId: donationProduct.lineId,
      price: {
        adjustment: {
          fixedPricePerUnit: {
            amount: donationProduct.donationAmount
          },
        }
      }
    }
  }

  return {
    operations: [update]
  }
};
