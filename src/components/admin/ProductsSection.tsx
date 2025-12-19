"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Package, Warehouse, Plus, Edit, Trash2, Eye, Copy } from "lucide-react";
import { ProductDetailFormStreamlined } from "./ProductDetailFormStreamlined";
import type { ProductDetail } from "@/models/ProductDetail";
import { productDetailService } from "@/services/client/product-detail-client.service";

export function ProductsSection() {
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const fetchedProducts = await productDetailService.getProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
      // Keep empty array on error
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsEditMode(false);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: ProductDetail) => {
    setSelectedProduct(product);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const handleDuplicateProduct = (product: ProductDetail) => {
    // Create a copy of the product without the ID
    const duplicatedProduct: ProductDetail = {
      ...product,
      id: undefined, // Remove ID so it creates a new product
      title: `${product.title} (Copy)`,
      slug: `${product.slug}-copy-${Date.now()}`, // Make slug unique
    };

    // Open in edit mode with the duplicated product
    setSelectedProduct(duplicatedProduct);
    setIsEditMode(false); // Set to false so it creates a new product
    setIsFormOpen(true);
  };

  const handleDeleteProduct = async (product: ProductDetail) => {
    if (confirm(`Are you sure you want to delete "${product.title}"?`)) {
      try {
        if (product.id) {
          await productDetailService.deleteProduct(product.id);
          alert('Product deleted successfully');
          await loadProducts(); // Refresh the list
        }
      } catch (error) {
        alert('Failed to delete product');
        console.error('Delete error:', error);
      }
    }
  };

  const handleFormSubmit = async (formData: Partial<ProductDetail>) => {
    try {
      if (isEditMode && selectedProduct?.id) {
        await productDetailService.updateProduct(selectedProduct.id, formData);
        alert('Product updated successfully');
      } else {
        await productDetailService.createProduct(formData);
        alert('Product added successfully');
      }
      setIsFormOpen(false);
      setSelectedProduct(null);
      await loadProducts(); // Refresh the list
    } catch (error) {
      alert('Operation failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      console.error('Form submit error:', error);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedProduct(null);
  };

  return (
    <>
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-blue-100/30">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Product Management
            </h2>
            <p className="text-sm text-slate-600">
              Manage products, inventory, and display settings.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleAddProduct}
              className="bg-[#1e3a8a] text-white hover:bg-[#1e3a8a]/90"
            >
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Add Product
            </Button>
            <Button
              variant="ghost"
              className="h-9 rounded-full border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
              onClick={loadProducts}
              disabled={isLoading}
            >
              <Warehouse className="mr-2 h-4 w-4" aria-hidden="true" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Firebase Products Management - Full Width */}
        <Card className="mt-6 border border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-slate-900">
              Products ({products.length})
            </CardTitle>
            <Badge
              variant="outline"
              className="border-[#1e3a8a]/40 text-[#1e3a8a]"
            >
              Firebase Connected
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-sm text-slate-500">Loading products...</div>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Package className="h-12 w-12 text-slate-300 mb-4" />
                <p className="text-sm text-slate-500 mb-2">No products found</p>
                <Button onClick={handleAddProduct} size="sm">
                  Add your first product
                </Button>
              </div>
            ) : (
              products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3"
                >
                  <div className="flex items-center gap-3">
                    {product.images && product.images.length > 0 && product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-200 rounded-md flex items-center justify-center">
                        <Package className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {product.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>₹{product.pricing?.salePrice || 0}</span>
                        <span>•</span>
                        <span>{product.stockStatus?.inStock ? 'In Stock' : 'Out of Stock'}</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/product/${product.slug}`, '_blank')}
                      className="h-8 w-8 p-0 text-green-600 hover:text-green-800 hover:bg-green-50"
                      title="Preview product page"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicateProduct(product)}
                      className="h-8 w-8 p-0 text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                      title="Duplicate product"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                      className="h-8 w-8 p-0 text-[#1e3a8a] hover:text-[#1e3a8a]/80 hover:bg-[#1e3a8a]/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProduct(product)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      {/* Product Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="w-[calc(100vw-4px)] h-[calc(100vh-4px)] max-w-[calc(100vw-4px)] max-h-[calc(100vh-4px)] overflow-y-auto p-6">

          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <ProductDetailFormStreamlined
            product={selectedProduct as ProductDetail}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
