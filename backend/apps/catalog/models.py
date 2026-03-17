from django.db import models


class ProductType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "product_types"
        verbose_name = "Product Type"
        verbose_name_plural = "Product Types"

    def __str__(self) -> str:
        return self.name


class Collection(models.Model):
    name = models.CharField(max_length=150, unique=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "collections"
        verbose_name = "Collection"
        verbose_name_plural = "Collections"

    def __str__(self) -> str:
        return self.name


class Master(models.Model):
    telegram_username = models.CharField(max_length=64, unique=True, blank=True, null=True)
    email = models.EmailField(max_length=255, unique=True)
    phone = models.CharField(max_length=32, unique=True, blank=True, null=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = "masters"
        verbose_name = "Master"
        verbose_name_plural = "Masters"

    def __str__(self) -> str:
        if self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.first_name


class Product(models.Model):
    name = models.CharField(max_length=255)
    size = models.CharField(max_length=100, blank=True, null=True)
    weight = models.IntegerField(blank=True, null=True)
    product_type = models.ForeignKey(
        ProductType,
        on_delete=models.PROTECT,
        related_name="products",
    )
    collection = models.ForeignKey(
        Collection,
        on_delete=models.PROTECT,
        related_name="products",
    )
    master = models.ForeignKey(
        Master,
        on_delete=models.PROTECT,
        related_name="products",
    )
    photo_blob = models.BinaryField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    material = models.CharField(max_length=150, blank=True, null=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    stock_qty = models.IntegerField(default=0)

    class Meta:
        db_table = "products"
        verbose_name = "Product"
        verbose_name_plural = "Products"
        constraints = [
            models.CheckConstraint(
                check=models.Q(weight__gte=0) | models.Q(weight__isnull=True),
                name="products_weight_gte_0",
            ),
            models.CheckConstraint(
                check=models.Q(price__gte=0) | models.Q(price__isnull=True),
                name="products_price_gte_0",
            ),
            models.CheckConstraint(
                check=models.Q(stock_qty__gte=0),
                name="products_stock_qty_gte_0",
            ),
        ]

    def __str__(self) -> str:
        return self.name
