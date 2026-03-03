from apps.checkout.services import validate_cart_items


def test_validate_cart_reports_missing_products():
    payload = [{"product_id": 10, "qty": 2}]
    result = validate_cart_items(payload)

    assert result["ok"] is False
    assert result["problems"] == [
        {"product_id": 10, "reason": "deleted_or_inactive"}
    ]
