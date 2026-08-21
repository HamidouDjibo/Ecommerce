import { computed, inject } from "@angular/core";
import { Product } from "./models/product";
import { patchState, signalMethod, signalStore, withComputed,withMethods, withState } from '@ngrx/signals'
import {produce} from 'immer';
import { Toaster } from "./services/toaster";
import { CartItem } from "./models/cart";

export type EcommerceState = {
    products: Product[];
    category: string;
    wishlistItems: Product[];
    cartItems : CartItem[];
}

export const EcommerceStore = signalStore(
    {
        providedIn: 'root'
    },
    withState({
        products: [
            {
                id: 1,
                name: "Casque Bluetooth Pro",
                description: "Casque sans fil avec réduction active du bruit.",
                price: 89.99,
                imageUrl: "https://picsum.photos/id/180/600/600",
                rating: 4.8,
                reviewCount: 245,
                inStock: true,
                category: "Electronique",
            },
            {
                id: 2,
                name: "Montre Connectée FitX",
                description: "Suivi de santé, GPS intégré et autonomie de 7 jours.",
                price: 129.99,
                imageUrl: "https://picsum.photos/id/26/600/600",
                rating: 4.6,
                reviewCount: 180,
                inStock: true,
                category: "Electronique",
            },
            {
                id: 3,
                name: "Enceinte Portable",
                description: "Son puissant avec certification IPX7.",
                price: 59.9,
                imageUrl: "https://picsum.photos/id/1080/600/600",
                rating: 4.5,
                reviewCount: 94,
                inStock: false,
                category: "Electronique",
            },
            {
                id: 4,
                name: "Lampe de Bureau LED",
                description: "Éclairage réglable avec port USB intégré.",
                price: 34.5,
                imageUrl: "https://picsum.photos/id/201/600/600",
                rating: 4.4,
                reviewCount: 67,
                inStock: true,
                category: "Maison",
            },
            {
                id: 5,
                name: "Chaise Scandinave",
                description: "Design moderne en bois massif.",
                price: 79.99,
                imageUrl: "https://picsum.photos/id/29/600/600",
                rating: 4.7,
                reviewCount: 132,
                inStock: true,
                category: "Maison",
            },
            {
                id: 6,
                name: "Service de Vaisselle",
                description: "Ensemble de 12 pièces en céramique.",
                price: 49.99,
                imageUrl: "https://picsum.photos/id/225/600/600",
                rating: 4.3,
                reviewCount: 58,
                inStock: true,
                category: "Maison",
            },
            {
                id: 7,
                name: "Tapis de Yoga Premium",
                description: "Antidérapant, épaisseur de 8 mm.",
                price: 29.99,
                imageUrl: "https://picsum.photos/id/433/600/600",
                rating: 4.8,
                reviewCount: 201,
                inStock: true,
                category: "Sport",
            },
            {
                id: 8,
                name: "Haltères Ajustables",
                description: "Paire d'haltères de 2 à 20 kg.",
                price: 149.99,
                imageUrl: "https://picsum.photos/id/1076/600/600",
                rating: 4.9,
                reviewCount: 156,
                inStock: true,
                category: "Sport",
            },
            {
                id: 9,
                name: "Sac de Sport",
                description: "Grand compartiment avec poche pour chaussures.",
                price: 39.99,
                imageUrl: "https://picsum.photos/id/21/600/600",
                rating: 4.4,
                reviewCount: 73,
                inStock: false,
                category: "Sport",
            },
            {
                id: 10,
                name: "Bouteille Isotherme",
                description: "Conserve les boissons chaudes 12 h et froides 24 h.",
                price: 24.99,
                imageUrl: "https://picsum.photos/id/30/600/600",
                rating: 4.7,
                reviewCount: 98,
                inStock: true,
                category: "Sport",
            },
        ],
        category: 'all',
        wishlistItems: [],
        cartItems : [], 
    } as EcommerceState ),
    withComputed(({ category, products, wishlistItems, cartItems }) => ({
        filteredProducts: computed(() => {
            if (category() === 'all') {
                return products();
            }

            return products().filter(
                p => p.category.toLowerCase() === category().toLowerCase()
            );

        }),
        wishlistCount: computed(() =>wishlistItems().length ),
        cartCount : computed(() => cartItems().reduce((acc, item) => acc + item.quantity, 0)),

    })),

    withMethods ((store , toaster = inject(Toaster)) => ({
        setCategory: signalMethod<string>((category: string) =>{
            patchState(store, {category})
        }),
        addToWishlist: (product: Product) => {
            const updatedWishlistItems = produce(store.wishlistItems(), (draft) => {
                if (!draft.find ((p) => p.id === product.id)) {
                    draft.push(product);
                }
            });
            patchState(store, {wishlistItems: updatedWishlistItems})
            toaster.success('Produit ajouté aux favoris');
        },
        removeFromWishlist: (product : Product) =>{
            patchState(store, {wishlistItems: store.wishlistItems().filter((p) => p.id !== product.id)});
            toaster.success('Produit retiré des favoris')
        },
        clearWishlist: () =>{
            patchState (store, {wishlistItems: []});
        },
        addToCart: (product: Product, quantity= 1)=>{
            const existingItemIndex = store.cartItems().findIndex(i => i.product.id === product.id);

            const updatedCartItems = produce(store.cartItems(), (draft)=>  {
                if (existingItemIndex !== -1){
                    draft[existingItemIndex].quantity += quantity;
                    return;
                }

                draft.push({
                    product, quantity
                })
            });

            patchState(store, {cartItems: updatedCartItems})
            toaster.success(existingItemIndex !== -1 ? 'Produit ajouté à nouveau': 'Produit ajouté à la carte')

        },
        setItemQuantity(params: {productId: number, quantity: number }){
            const index = store.cartItems().findIndex(c => c.product.id === params.productId);
            const updated = produce(store.cartItems(), (draft) => {
                draft[index].quantity = params.quantity
            });

            patchState(store, {cartItems: updated});

        },

        addAllWishlistToCart: () => {
            const updatedCartItems = produce(store.cartItems(), (draft) => {
                store.wishlistItems().forEach(p => {
                    if (!draft.find(c => c.product.id === p.id)) {
                        draft.push({product: p, quantity: 1});
                    }
                })
            })

            patchState(store, {cartItems: updatedCartItems, wishlistItems: []})
        },
        moveToWishlist: (product: Product) => {
            const updatedCartItems = store.cartItems().filter((p => p.product.id !== product.id ));
            const updatedWishlistItems = produce(store.wishlistItems(), (draft) => {
                if (!draft.find(p => p.id === product.id)) {
                    draft.push(product)
                }
            })
            patchState(store, {cartItems: updatedCartItems, wishlistItems: updatedWishlistItems});

        },
        removeFromCart: (product: Product) =>{
            patchState(store, {cartItems: store.cartItems().filter(c => c.product.id !== product.id),

            });
        },

               
    }))
);

