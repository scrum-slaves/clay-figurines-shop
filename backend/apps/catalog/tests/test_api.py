from decimal import Decimal

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .factories import create_collection, create_master, create_product, create_product_type


class CatalogApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.animals_type = create_product_type(name="Animals")
        cls.decor_type = create_product_type(name="Decor")
        cls.spring_collection = create_collection(name="Spring")
        cls.night_collection = create_collection(name="Night")
        cls.master = create_master(
            telegram_username="clay_master",
            email="master@example.com",
            phone="+1234567890",
            first_name="Anna",
            last_name="Potter",
        )

        cls.cat_product = create_product(
            name="Cat Figurine",
            description="Small clay cat",
            product_type=cls.animals_type,
            collection=cls.spring_collection,
            master=cls.master,
            price=Decimal("1200.00"),
            stock_qty=5,
        )
        cls.owl_product = create_product(
            name="Owl Figurine",
            description="Night owl",
            product_type=cls.animals_type,
            collection=cls.night_collection,
            master=cls.master,
            price=Decimal("1800.00"),
            stock_qty=1,
        )
        cls.vase_product = create_product(
            name="Mini Vase",
            description="Decor item",
            product_type=cls.decor_type,
            collection=cls.spring_collection,
            master=cls.master,
            price=Decimal("900.00"),
            stock_qty=0,
        )

    def test_get_types_returns_product_types(self):
        response = self.client.get(reverse("type-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertCountEqual(
            response.json(),
            [
                {"id": self.animals_type.id, "name": "Animals"},
                {"id": self.decor_type.id, "name": "Decor"},
            ],
        )

    def test_get_products_returns_product_cards(self):
        response = self.client.get(reverse("product-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.json()

        self.assertEqual(len(payload), 3)
        self.assertEqual(payload[0]["name"], self.cat_product.name)
        self.assertIn("in_stock", payload[0])
        self.assertIn("product_type", payload[0])
        self.assertIn("collection", payload[0])

    def test_get_products_filters_by_type(self):
        response = self.client.get(reverse("product-list"), {"type": [self.decor_type.id]})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            [item["id"] for item in response.json()],
            [self.vase_product.id],
        )

    def test_get_product_detail_returns_full_product_card(self):
        response = self.client.get(reverse("product-detail", args=[self.owl_product.id]))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.json()

        self.assertEqual(payload["id"], self.owl_product.id)
        self.assertEqual(payload["name"], self.owl_product.name)
        self.assertEqual(payload["product_type"]["id"], self.animals_type.id)
        self.assertEqual(payload["collection"]["id"], self.night_collection.id)
        self.assertEqual(payload["master"]["email"], self.master.email)
        self.assertTrue(payload["in_stock"])

    def test_checkout_returns_ok_true_for_valid_cart(self):
        response = self.client.post(
            reverse("checkout-validate"),
            {"items": [{"product_id": self.cat_product.id, "qty": 2}]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {"ok": True, "problems": []})

    def test_checkout_returns_deleted_or_inactive_for_missing_product(self):
        response = self.client.post(
            reverse("checkout-validate"),
            {"items": [{"product_id": 999_999, "qty": 1}]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.json(),
            {
                "ok": False,
                "problems": [{"product_id": 999_999, "reason": "deleted_or_inactive"}],
            },
        )

    def test_checkout_returns_not_enough_stock_with_missing_quantity(self):
        response = self.client.post(
            reverse("checkout-validate"),
            {"items": [{"product_id": self.owl_product.id, "qty": 3}]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.json(),
            {
                "ok": False,
                "problems": [
                    {
                        "product_id": self.owl_product.id,
                        "reason": "not_enough_stock",
                        "missing": 2,
                    }
                ],
            },
        )

    def test_checkout_returns_all_detected_problems_for_mixed_cart(self):
        response = self.client.post(
            reverse("checkout-validate"),
            {
                "items": [
                    {"product_id": self.owl_product.id, "qty": 4},
                    {"product_id": 555_555, "qty": 1},
                ]
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertCountEqual(
            response.json()["problems"],
            [
                {
                    "product_id": self.owl_product.id,
                    "reason": "not_enough_stock",
                    "missing": 3,
                },
                {
                    "product_id": 555_555,
                    "reason": "deleted_or_inactive",
                },
            ],
        )
        self.assertFalse(response.json()["ok"])

    def test_checkout_accepts_empty_items(self):
        response = self.client.post(
            reverse("checkout-validate"),
            {"items": []},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {"ok": True, "problems": []})

    def test_checkout_rejects_invalid_qty(self):
        response = self.client.post(
            reverse("checkout-validate"),
            {"items": [{"product_id": self.cat_product.id, "qty": 0}]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("qty", response.json()["items"][0])

    def test_checkout_rejects_invalid_product_id(self):
        response = self.client.post(
            reverse("checkout-validate"),
            {"items": [{"product_id": 0, "qty": 1}]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("product_id", response.json()["items"][0])

    def test_checkout_rejects_invalid_payload_shape(self):
        response = self.client.post(
            reverse("checkout-validate"),
            {"items": {"product_id": self.cat_product.id, "qty": 1}},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("items", response.json())
