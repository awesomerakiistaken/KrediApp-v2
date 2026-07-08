using Microsoft.ML.Data;

namespace KrediApp.ML;

public class CreditData
{
    [LoadColumn(0)] public string StatusOfExistingCheckingAccount { get; set; } = string.Empty;
    [LoadColumn(1)] public float DurationInMonths { get; set; }
    [LoadColumn(2)] public string CreditHistory { get; set; } = string.Empty;
    [LoadColumn(3)] public string Purpose { get; set; } = string.Empty;
    [LoadColumn(4)] public float CreditAmount { get; set; }
    [LoadColumn(5)] public string SavingsAccount { get; set; } = string.Empty;
    [LoadColumn(6)] public string PresentEmploymentSince { get; set; } = string.Empty;
    [LoadColumn(7)] public float InstallmentRateInPercentageOfDisposableIncome { get; set; }
    [LoadColumn(8)] public string PersonalStatusAndSex { get; set; } = string.Empty;
    [LoadColumn(9)] public string OtherDebtorsGuarantors { get; set; } = string.Empty;
    [LoadColumn(10)] public float PresentResidenceSince { get; set; }
    [LoadColumn(11)] public string Property { get; set; } = string.Empty;
    [LoadColumn(12)] public float AgeInYears { get; set; }
    [LoadColumn(13)] public string OtherInstallmentPlans { get; set; } = string.Empty;
    [LoadColumn(14)] public string Housing { get; set; } = string.Empty;
    [LoadColumn(15)] public float NumberOfExistingCreditsAtThisBank { get; set; }
    [LoadColumn(16)] public string Job { get; set; } = string.Empty;
    [LoadColumn(17)] public float NumberOfPeopleBeingLiableToProvideMaintenanceFor { get; set; }
    [LoadColumn(18)] public string Telephone { get; set; } = string.Empty;
    [LoadColumn(19)] public string ForeignWorker { get; set; } = string.Empty;

    // 1 = İyi kredi, 2 = Kötü kredi
    [LoadColumn(20)] public float RiskLabelRaw { get; set; }
}
