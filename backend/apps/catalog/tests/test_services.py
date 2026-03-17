from unittest.mock import patch

from django.test import SimpleTestCase, TestCase

from apps.catalog.services import validate_cart_items

from .factories import create_product


class ValidateCartItemsServiceTests(TestCase):
    def test_validate_cart_items_aggregates_duplicate_items_before_stock_check(self):
        product = create_product(stock_qty=3)

        result = validate_cart_items(
            [
                {"product_id": product.id, "qty": 2},
                {"product_id": product.id, "qty": 2},
            ]
        )

        self.assertFalse(result["ok"])
        self.assertEqual(
            result["problems"],
            [
                {
                    "product_id": product.id,
                    "reason": "not_enough_stock",
                    "missing": 1,
                }
            ],
        )

    def test_validate_cart_items_marks_unknown_products_as_deleted_or_inactive(self):
        result = validate_cart_items([{"product_id": 999_999, "qty": 1}])

        self.assertEqual(
            result,
            {
                "ok": False,
                "problems": [{"product_id": 999_999, "reason": "deleted_or_inactive"}],
            },
        )


class ValidateCartItemsInactiveBranchTests(SimpleTestCase):
    @patch(
        "apps.catalog.services.get_products_by_ids",
        return_value={17: {"id": 17, "is_active": False, "stock": 5}},
    )
    def test_validate_cart_items_marks_inactive_products_as_deleted_or_inactive(self, mocked_get_products_by_ids):
        result = validate_cart_items([{"product_id": 17, "qty": 1}])

        self.assertEqual(
            result,
            {
                "ok": False,
                "problems": [{"product_id": 17, "reason": "deleted_or_inactive"}],
            },
        )
        mocked_get_products_by_ids.assert_called_once_with([17])
