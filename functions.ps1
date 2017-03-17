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
        }
    }	
}

function Get-PackagePath($packageId, $projectPath) {
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