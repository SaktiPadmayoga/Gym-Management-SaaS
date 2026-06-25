with open('app/Services/POSService.php', 'r') as f:
    content = f.read()

old_code = """    private function resolveProduct(array $item): array
    {
        $product = Product::findOrFail($item['id']);"""

new_code = """    private function resolveProduct(array $item): array
    {
        $product = Product::lockForUpdate()->findOrFail($item['id']);"""

content = content.replace(old_code, new_code)

with open('app/Services/POSService.php', 'w') as f:
    f.write(content)
