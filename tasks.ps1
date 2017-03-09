param(
    $outputDirectory = (property outputDirectory "artifacts")
)

$absoluteOutputDirectory= "$((Get-Location).Path)\$outputDirectory"
$projects = Get-SolutionProjects

task Clean {
	if((Test-Path $absoluteOutputDirectory))
	{
		Write-Host "Cleaning artifacts directory $absoluteOutputDirectory"
		Remove-Item "$absoluteOutputDirectory" -Recurse -Force -ErrorAction SilentlyContinue | Out-Null
	}
	New-Item $absoluteOutputDirectory -ItemType Directory | Out-Null

	$projects | 
		ForEach-Object {
			Write-Host "Cleaning bin and obj folders for $($_.Directory)"
			Remove-Item "$($_.Directory)\bin" -Recurse -Force -ErrorAction SilentlyContinue | Out-Null
			Remove-Item "$($_.Directory)\obj" -Recurse -Force -ErrorAction SilentlyContinue | Out-Null
		}
}