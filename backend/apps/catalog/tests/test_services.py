from apps.catalog import services


def test_catalog_services_are_todo_stubs():
    try:
        services.list_types()
    except NotImplementedError as exc:
        assert "TODO: подключить модели" in str(exc)
