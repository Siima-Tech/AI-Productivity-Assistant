// Published business policies. The owner should replace these placeholders with confirmed details.
export const POLICIES = {
  ordering:
    "Orders are placed through the online shop. Checkout is currently a demonstration: no payment is taken and no card details are collected. The shop owner will confirm your order by email.",
  delivery:
    "Delivery options, areas and fees have not been published yet. Please contact us to confirm delivery before ordering.",
  returns:
    "Returns and refund terms have not been published yet. Please contact us with any concerns about your order.",
  gifts:
    "You can add a personal gift message and recipient name to a candle. Gift wrapping and custom packaging are not currently offered unless confirmed by the shop owner.",
  candleCare:
    "Always follow the instructions on the candle label, never leave a burning candle unattended, keep candles away from children, pets, drafts and anything flammable, and trim the wick before lighting.",
  products:
    "All products currently listed are clearly labelled sample products. Prices, stock and details will be confirmed by the owner.",
};

export const POLICIES_TEXT = Object.entries(POLICIES)
  .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
  .join("\n");
