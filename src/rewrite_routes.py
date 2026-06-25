import re

with open('routes/tenant.php', 'r') as f:
    content = f.read()

# Replace the main group
content = content.replace(
    "Route::middleware(['auth:staff', 'check_tenant_access'])->group(function () {",
    "Route::middleware(['auth:staff', 'check_tenant_access', 'check_branch_access'])->group(function () {"
)

# I will just write a custom script that injects the wrappers manually based on lines.
