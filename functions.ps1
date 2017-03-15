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