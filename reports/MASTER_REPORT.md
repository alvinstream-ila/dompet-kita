# 🧭 DOMPET KITA - MASTER AUDIT REPORT

Generated at: 2026-04-16T02:27:56.484Z

## 📄 BACKEND INSIGHTS FIX

```


   JsonException 

  Syntax error

  at vendor\nunomaduro\phpinsights\src\Domain\Insights\SyntaxCheck.php:57
     53▕         }
     54▕         $configuration = Container::make()->get(Configuration::class);
     55▕         $process->setTimeout($configuration->getTimeout())->run();
     56▕ 
  ➜  57▕         $output = json_decode($process->getOutput(), true, 512, JSON_THROW_ON_ERROR);
     58▕         $errors = $output['results']['errors'] ?? [];
     59▕ 
     60▕         foreach ($errors as $error) {
     61▕             if (preg_match('/^.*error:(.*) in .* on line [\d]+/m', $error['message'], $matches) === 1) {

  1   vendor\nunomaduro\phpinsights\src\Domain\Insights\SyntaxCheck.php:57

  2   vendor\nunomaduro\phpinsights\src\Domain\Runner.php:171
      NunoMaduro\PhpInsights\Domain\Insights\SyntaxCheck::process()


```

## 📄 BACKEND INSIGHTS

```


   JsonException 

  Syntax error

  at vendor\nunomaduro\phpinsights\src\Domain\Insights\SyntaxCheck.php:57
     53▕         }
     54▕         $configuration = Container::make()->get(Configuration::class);
     55▕         $process->setTimeout($configuration->getTimeout())->run();
     56▕ 
  ➜  57▕         $output = json_decode($process->getOutput(), true, 512, JSON_THROW_ON_ERROR);
     58▕         $errors = $output['results']['errors'] ?? [];
     59▕ 
     60▕         foreach ($errors as $error) {
     61▕             if (preg_match('/^.*error:(.*) in .* on line [\d]+/m', $error['message'], $matches) === 1) {

  1   vendor\nunomaduro\phpinsights\src\Domain\Insights\SyntaxCheck.php:57

  2   vendor\nunomaduro\phpinsights\src\Domain\Runner.php:171
      NunoMaduro\PhpInsights\Domain\Insights\SyntaxCheck::process()


```

## 📄 BACKEND PHPSTAN

```

 [OK] No errors                                                                                                        


```

## 📄 BACKEND PINT

```

  ✓✓.....✓.✓✓✓✓.✓✓.✓✓..✓...✓....✓✓...✓..✓✓✓✓..✓✓.....✓.✓...........................................✓......✓✓✓✓✓......✓
  ......✓..✓....................✓...........✓✓.✓.✓✓✓✓✓......✓.✓..........✓✓✓...✓......................................
  ...............................................................

  ──────────────────────────────────────────────────────────────────────────────────────────────────────────── Laravel  
    FIXED   ......................................................................... 295 files, 48 style issues fixed  
  ✓ app\Actions\AI\AnalyzeReceiptAction.php unary_operator_spaces, not_operator_with_successor_space, single_line_emp…  
  ✓ app\Actions\AI\ChatWithAiAction.php                                                         single_line_empty_body  
  ✓ app\Actions\AI\GenerateInsightAction.php unary_operator_spaces, not_operator_with_successor_space, single_line_em…  
  ✓ app\Actions\AI\GetLegacyAdviceAction.php                                                    single_line_empty_body  
  ✓ app\Actions\AI\GetTaxAdviceAction.php                                                       single_line_empty_body  
  ✓ app\Actions\AI\GetWealthAdviceAction.php                                                    single_line_empty_body  
  ✓ app\Actions\AI\GuardianAnalyzeAction.php                                                    single_line_empty_body  
  ✓ app\Actions\AI\PerformSelfHealingAction.php                                                 single_line_empty_body  
  ✓ app\Actions\AI\SystemHealthCheckAction.php                                                  single_line_empty_body  
  ✓ app\Actions\Finance\Asset\CreateAssetAction.php unary_operator_spaces, not_operator_with_successor_space, single_…  
  ✓ app\Actions\Finance\Asset\DeleteAssetAction.php                                             single_line_empty_body  
  ✓ app\Actions\Finance\Asset\UpdateAssetAction.php                                             single_line_empty_body  
  ✓ app\Actions\Finance\GetQuantumInsightsAction.php                                            single_line_empty_body  
  ✓ app\Actions\Finance\PerformCfoAnalysisAction.php                                            single_line_empty_body  
  ✓ app\Actions\Finance\ProcessScheduledTransactionsAction.php                                  single_line_empty_body  
  ✓ app\Actions\Finance\Transaction\GetTransactionSummaryAction.php                             single_line_empty_body  
  ✓ app\Actions\Finance\Wealth\ForecastWealthAction.php                                         single_line_empty_body  
  ✓ app\Actions\Finance\Wealth\SimulateMonteCarloAction.php                                     single_line_empty_body  
  ✓ app\Actions\Finance\Wealth\SimulatePurchaseAction.php                                       single_line_empty_body  
  ✓ app\Actions\Finance\Wealth\SyncMarketAssetsAction.php unary_operator_spaces, not_operator_with_successor_space, s…  
  ✓ app\Actions\Security\DeadMansSwitch\CheckTriggerAction.php                                  single_line_empty_body  
  ✓ app\Actions\Security\DeadMansSwitch\GenerateReportAction.php                                single_line_empty_body  
  ✓ app\Actions\System\BackupDatabaseAction.php unary_operator_spaces, not_operator_with_successor_space, single_line…  
  ✓ app\Actions\System\GetSystemStatusAction.php                                                single_line_empty_body  
  ✓ app\Console\Commands\TestLangSmithTrace.php                                                   new_with_parentheses  
  ✓ app\Exceptions\AiServiceException.php                                                       single_line_empty_body  
  ✓ app\Exceptions\FileStorageException.php                                                     single_line_empty_body  
  ✓ app\Exceptions\MailTransportException.php                                                   single_line_empty_body  
  ✓ app\Exceptions\MarketServiceException.php                                                   single_line_empty_body  
  ✓ app\Http\Controllers\AIController.php unary_operator_spaces, not_operator_with_successor_space, single_line_empty…  
  ✓ app\Http\Controllers\LegacyController.php unary_operator_spaces, not_operator_with_successor_space, single_line_e…  
  ✓ app\Http\Controllers\TaxController.php unary_operator_spaces, not_operator_with_successor_space, single_line_empt…  
  ✓ app\Http\Controllers\TransactionController.php unary_operator_spaces, not_operator_with_successor_space, single_l…  
  ✓ app\Models\Asset.php                                                                             phpdoc_separation  
  ✓ app\Models\ScheduledTransaction.php                                                              phpdoc_separation  
  ✓ app\Models\Transaction.php             unary_operator_spaces, phpdoc_separation, not_operator_with_successor_space  
  ✓ app\Models\User.php                                                                              phpdoc_separation  
  ✓ app\Notifications\LargeExpenseNotification.php                        new_with_parentheses, single_line_empty_body  
  ✓ app\Notifications\LegacyTriggerNotification.php new_with_parentheses, unary_operator_spaces, not_operator_with_su…  
  ✓ app\Notifications\PartnerInvitationNotification.php                   new_with_parentheses, single_line_empty_body  
  ✓ app\Notifications\ResetPasswordOTPNotification.php                                            new_with_parentheses  
  ✓ app\Notifications\VerifyEmailNotification.php                                                 new_with_parentheses  
  ✓ app\Providers\AiServiceProvider.php                                   new_with_parentheses, single_line_empty_body  
  ✓ app\Providers\MailServiceProvider.php                                 new_with_parentheses, single_line_empty_body  
  ✓ app\Services\FinancialIntelligenceService.php                                                    phpdoc_separation  
  ✓ app\Services\GeminiService.php                                                              single_line_empty_body  
  ✓ app\Services\LegacyService.php                                                              single_line_empty_body  
  ✓ app\Services\SelfHealingService.php                                                         single_line_empty_body  


```

## 📄 BACKEND RECTOR FIX

```

 [WARNING] The "strictBooleans" set is deprecated as mostly risky and not practical. Remove it from withPreparedSets() 
           method and use "codeQuality" and "codingStyle" sets instead. They already contain more granular and stable  
           rules on same note.                                                                                         


 [ERROR] Your config already enables type declarations set.                                                            
         Remove "->withTypeCoverageLevel()" as it only duplicates it, or remove type declaration set.                  


```

## 📄 BACKEND RECTOR

```

 [ERROR] Your config already enables dead code set.                                                                    
         Remove "->withDeadCodeLevel()" as it only duplicates it, or remove dead code set.                             


```

## 📄 FRONTEND BIOME FIX

```
The number of diagnostics exceeds the limit allowed. Use --max-diagnostics to increase it.
Diagnostics not shown: 17.
Checked 182 files in 263ms. Fixed 1 file.
Found 30 errors.
Found 6 warnings.

```

## 📄 FRONTEND BIOME

```
The number of diagnostics exceeds the limit allowed. Use --max-diagnostics to increase it.
Diagnostics not shown: 10.
Checked 182 files in 130ms. No fixes applied.
Found 23 errors.
Found 6 warnings.

```

