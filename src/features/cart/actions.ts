"use server";

import * as cart from "@/services/cart";

/* Dünne Server-Action-Schicht: Validierung und Preislogik liegen im Service (serverseitig). */

export async function getCartAction() {
  return cart.getCartView();
}

export async function addToCartAction(variantId: string, quantity = 1) {
  return cart.addItem(String(variantId), Number(quantity) || 1);
}

export async function setQuantityAction(variantId: string, quantity: number) {
  return cart.setQuantity(String(variantId), Math.floor(Number(quantity)));
}

export async function removeItemAction(variantId: string) {
  return cart.removeItem(String(variantId));
}

export async function applyCouponAction(code: string) {
  return cart.applyCoupon(String(code ?? ""));
}

export async function removeCouponAction() {
  return cart.removeCoupon();
}

export async function toggleSampleAction(sampleId: string) {
  return cart.toggleSample(String(sampleId));
}
