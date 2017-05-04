function Get-SolutionProjects
{
	Add-Type -Path (${env:ProgramFiles(x86)} + '\Reference Assemblies\Microsoft\MSBuild\v14.0\Microsoft.Build.dll')
	
	$solutionFile = (Get-ChildItem('*.sln')).FullName | Select -First 1
	$solution = [Microsoft.Build.Construction.SolutionFile] $solutionFile
	
	return $solution.ProjectsInOrder | 
		Where-Object {$_.ProjectType -eq 'KnownToBeMSBuildFormat'} |
        ForEach-Object {
		$isWebProject = (Select-String -pattern "<UseIISExpress>.+</UseIISExpress>" -path $_.AbsolutePath) -ne $null
        @{
			Path = $_.AbsolutePath;
			Name = $_.ProjectName;
			Directory = "$(Split-Path -Path $_.AbsolutePath -Resolve)";
			IsWebProject = $isWebProject;
			PackageId = $_.ProjectName -replace "\.", "-";
        }
    }	
}

function Get-PackagePath($packageId, $projectPath) 
{
	if (!(Test-Path "$projectPath\packages.config")) {
		throw "Could not find a packages.config file at $project"
	}	

	[xml]$packagesXml = Get-Content "$projectPath\packages.config"
	$package = $packagesXml.packages.package | Where { $_.id -eq $packageId }
	if (!$package) {
		return $null
	}
	return "packages\$($package.id).$($package.version)"
}

$preRelease = $(Get-Date).ToString("yyMMddHHmmss")
function Get-Version($projectPath)
{	
	$line = Get-Content "$projectPath\Properties\AssemblyInfo.cs" | Where { $_.Contains("AssemblyVersion") }
	if (!$line) {
		throw "Couldn't find an AssemblyVersion attribute"
	}
	
	$version = $line.Split('"')[1]
	
	$isLocal = [String]::IsNullOrEmpty($env:BUILD_SERVER)
	
	if($isLocal){
		$version = "$($version.Replace("*", 0))-pre$preRelease"
	} else{
		$version = $version.Replace("*", $env:BUILD_NUMBER)
	}	
	return $version
}