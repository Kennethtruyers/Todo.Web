cls

$nugetPath = "$env:LOCALAPPDATA\NuGet\NuGet.exe"

if (!(Get-Command NuGet -ErrorAction SilentlyContinue) -and !(Test-Path $nugetPath)) {
	Write-Host 'Downloading NuGet.exe'
	(New-Object System.Net.WebClient).DownloadFile("https://dist.nuget.org/win-x86-commandline/latest/nuget.exe", $nugetPath)
} 

if (Test-Path $nugetPath) { 
	Set-Alias NuGet (Resolve-Path $nugetPath)
} 
Write-Host 'Restoring NuGet packages'
NuGet restore

. '.\functions.ps1'

$invokeBuild = (Get-ChildItem('.\packages\Invoke-Build*\tools\Invoke-Build.ps1')).FullName | Sort-Object $_ | Select -Last 1
& $invokeBuild $args -File tasks.ps1