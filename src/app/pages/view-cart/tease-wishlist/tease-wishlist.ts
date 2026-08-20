import { Component, inject } from '@angular/core';
import { ViewPanel } from "../../../directives/view-panel";
import { MatIcon } from '@angular/material/icon';
import { EcommerceStore } from '../../../ecommerce-store';
import { RouterLink } from "@angular/router";
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-tease-wishlist',
  imports: [ViewPanel, MatIcon, RouterLink, MatButton],
  template: `
  <div appViewPanel class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <mat-icon class="!text-red-500">favorite_border</mat-icon>
      <div>
        <h2 class="text-xl font-bold">Wishlist ({{store.wishlistCount() }})</h2>
        <p class="text-gray-500 text-sm">You have {{ store.wishlistCount()}} item(s) saved for later</p>
      </div>

    </div>
    <div class="flex items-center gap-3">
      <button matButton routerLink="/wishlist">View All </button>
      <button matButton="filled" class="flex items-center gap-2 ">
        <mat-icon>shopping_cart</mat-icon>
        Add all to cart
      </button>
    </div>

  </div>
  `,
  styles: ``,
})
export class TeaseWishlist {
  
  store = inject(EcommerceStore);

}
