Add-Type -AssemblyName System.Drawing

function New-Icon($size, $path) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode    = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode= [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.TextRenderingHint= [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $bg = [System.Drawing.Color]::FromArgb(27, 27, 30)
  $g.Clear($bg)

  $u = $size / 96.0
  $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
  $amber = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 193, 7))
  $road  = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(60, 60, 67))
  $tire  = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40, 40, 45))

  $g.FillRectangle($road, 0, [int]($size * 0.78), $size, [int]($size * 0.10))

  $cabX = [int]($size * 0.18);  $cabY = [int]($size * 0.38)
  $cabW = [int]($size * 0.30);  $cabH = [int]($size * 0.30)
  $g.FillRectangle($amber, $cabX, $cabY, $cabW, $cabH)

  $boxX = [int]($size * 0.46); $boxY = [int]($size * 0.34)
  $boxW = [int]($size * 0.40); $boxH = [int]($size * 0.36)
  $g.FillRectangle($white, $boxX, $boxY, $boxW, $boxH)

  $wheelR = [int]($size * 0.075)
  $wheelY = [int]($size * 0.74)
  function DrawWheel($cx) {
    $g.FillEllipse($tire, ($cx - $wheelR), ($wheelY - $wheelR), ($wheelR * 2), ($wheelR * 2))
  }
  DrawWheel ([int]($size * 0.26))
  DrawWheel ([int]($size * 0.58))
  DrawWheel ([int]($size * 0.78))

  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}

$root = $PSScriptRoot
if (-not $root) { $root = $PWD.Path }
$root = Get-Location
New-Icon 192 (Join-Path $root 'icon-192.png')
New-Icon 512 (Join-Path $root 'icon-512.png')
Write-Output "icones gerados em $root"
