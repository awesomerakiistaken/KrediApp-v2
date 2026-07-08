using Microsoft.ML;
using Microsoft.ML.Trainers.FastTree;

namespace KrediApp.ML;

public static class ModelBuilder
{
    public static void TrainAndSaveModel(string dataPath, string modelPath)
    {
        var mlContext = new MLContext(seed: 1);

        IDataView dataView = mlContext.Data.LoadFromTextFile<CreditData>(
            path: dataPath,
            hasHeader: false,
            separatorChar: ' ');

        var dataProcessPipeline = mlContext.Transforms.Conversion.MapValue<float, bool>(
            outputColumnName: "Label",
            inputColumnName: nameof(CreditData.RiskLabelRaw),
            keyValuePairs: new[]
            {
                new KeyValuePair<float, bool>(1.0f, false),
                new KeyValuePair<float, bool>(2.0f, true)
            })
            .Append(mlContext.Transforms.Categorical.OneHotEncoding(nameof(CreditData.StatusOfExistingCheckingAccount)))
            .Append(mlContext.Transforms.Categorical.OneHotEncoding(nameof(CreditData.CreditHistory)))
            .Append(mlContext.Transforms.Categorical.OneHotEncoding(nameof(CreditData.Purpose)))
            .Append(mlContext.Transforms.Categorical.OneHotEncoding(nameof(CreditData.SavingsAccount)))
            .Append(mlContext.Transforms.Categorical.OneHotEncoding(nameof(CreditData.PresentEmploymentSince)))
            .Append(mlContext.Transforms.Categorical.OneHotEncoding(nameof(CreditData.PersonalStatusAndSex)))
            .Append(mlContext.Transforms.Categorical.OneHotEncoding(nameof(CreditData.OtherDebtorsGuarantors)))
            .Append(mlContext.Transforms.Categorical.OneHotEncoding(nameof(CreditData.Property)))
            .Append(mlContext.Transforms.Categorical.OneHotEncoding(nameof(CreditData.OtherInstallmentPlans)))
            .Append(mlContext.Transforms.Categorical.OneHotEncoding(nameof(CreditData.Housing)))
            .Append(mlContext.Transforms.Categorical.OneHotEncoding(nameof(CreditData.Job)))
            .Append(mlContext.Transforms.Categorical.OneHotEncoding(nameof(CreditData.Telephone)))
            .Append(mlContext.Transforms.Categorical.OneHotEncoding(nameof(CreditData.ForeignWorker)))
            .Append(mlContext.Transforms.Concatenate("Features",
                nameof(CreditData.StatusOfExistingCheckingAccount),
                nameof(CreditData.DurationInMonths),
                nameof(CreditData.CreditHistory),
                nameof(CreditData.Purpose),
                nameof(CreditData.CreditAmount),
                nameof(CreditData.SavingsAccount),
                nameof(CreditData.PresentEmploymentSince),
                nameof(CreditData.InstallmentRateInPercentageOfDisposableIncome),
                nameof(CreditData.PersonalStatusAndSex),
                nameof(CreditData.OtherDebtorsGuarantors),
                nameof(CreditData.PresentResidenceSince),
                nameof(CreditData.Property),
                nameof(CreditData.AgeInYears),
                nameof(CreditData.OtherInstallmentPlans),
                nameof(CreditData.Housing),
                nameof(CreditData.NumberOfExistingCreditsAtThisBank),
                nameof(CreditData.Job),
                nameof(CreditData.NumberOfPeopleBeingLiableToProvideMaintenanceFor),
                nameof(CreditData.Telephone),
                nameof(CreditData.ForeignWorker)
            ));

        var trainer = mlContext.BinaryClassification.Trainers.FastTree(labelColumnName: "Label", featureColumnName: "Features");
        var trainingPipeline = dataProcessPipeline.Append(trainer);

        Console.WriteLine("Model eğitiliyor...");
        ITransformer trainedModel = trainingPipeline.Fit(dataView);

        Console.WriteLine($"Model kaydediliyor: {modelPath}");
        mlContext.Model.Save(trainedModel, dataView.Schema, modelPath);
        Console.WriteLine("Model başarıyla kaydedildi.");
    }
}
