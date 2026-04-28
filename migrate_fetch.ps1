# Migrate ordering-app-site pages to use apiFetch
# Only replaces fetch calls in pages (not in contexts/ which manage auth themselves)

$pagesDir = "src\pages"
$files = Get-ChildItem -Path $pagesDir -Filter "*.tsx"

foreach ($file in $files) {
    $path = $file.FullName
    $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

    if ($content.Contains("await fetch(")) {
        if (-not $content.Contains("from '../api'")) {
            $content = "import { apiFetch } from '../api';" + [System.Environment]::NewLine + $content
        }
        $content = $content.Replace("await fetch(", "await apiFetch(")
        [System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
        Write-Host "Updated ordering-app: $($file.Name)"
    }
}

# Also migrate components
$compDir = "src\components"
$compFiles = Get-ChildItem -Path $compDir -Filter "*.tsx" -ErrorAction SilentlyContinue

foreach ($file in $compFiles) {
    $path = $file.FullName
    $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

    if ($content.Contains("await fetch(")) {
        if (-not $content.Contains("from '../api'")) {
            $content = "import { apiFetch } from '../api';" + [System.Environment]::NewLine + $content
        }
        $content = $content.Replace("await fetch(", "await apiFetch(")
        [System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
        Write-Host "Updated ordering-app component: $($file.Name)"
    }
}

Write-Host "Ordering app migration complete."
