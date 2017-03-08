cls

. '.\functions.ps1'

$invokeBuild = (Get-ChildItem('.\packages\Invoke-Build*\tools\Invoke-Build.ps1')).FullName | Sort-Object $_ | Select -Last 1
& $invokeBuild $args -File tasks.ps1