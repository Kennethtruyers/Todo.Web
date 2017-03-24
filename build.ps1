cls

Write-Host "Checking NuGet"

$nugetPath = "$env:LOCALAPPDATA\NuGet\NuGet.exe"

if (!(Get-Command NuGet -ErrorAction SilentlyContinue) -and !(Test-Path $nugetPath)) {
    if(! (Test-Path "$env:LOCALAPPDATA\NuGet"))
    {
        Write-Host "Creating directory"
        New-Item -ItemType Directory "$env:LOCALAPPDATA\NuGet"
    }
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
