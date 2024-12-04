#include <stdio.h>
#include <math.h>
#include <stdlib.h>
#include <time.h>

// Function to calculate mean of an array (already provided)
double calculate_mean(double *data, int size)
{

    double sum = 0.0;
    for (int i = 0; i < size; i++)
    {
        sum += data[i];
    }
    double mean = sum / size;

    return mean;
}

// Function to calculate variance
double calculate_variance(double *data, int size)
{

    double mean = calculate_mean(data, size);
    double sum_of_squares = 0.0;
    for (int i = 0; i < size; i++)
    {
        sum_of_squares += (data[i] - mean) * (data[i] - mean);
    }
    double variance = sum_of_squares / (size - 1); // Sample variance

    return variance;
}

// Function for sampling 'sample_size' elements from 'data'
void sample_data(double *data, int size, double *sample, int sample_size)
{
    srand(time(NULL)); // Initialize random seed
    for (int i = 0; i < sample_size; i++)
    {
        int rand_index = rand() % size; // Select a random index
        sample[i] = data[rand_index];   // Add it to the sample
    }
}

// Function to perform two-sample t-test
double t_test(double *group1, int size1, double *group2, int size2)
{

    // Calculate means
    double mean1 = calculate_mean(group1, size1);
    double mean2 = calculate_mean(group2, size2);

    // Calculate variances
    double variance1 = calculate_variance(group1, size1);
    double variance2 = calculate_variance(group2, size2);

    // Calculate pooled variance
    double pooled_variance = (variance1 / size1) + (variance2 / size2);

    // Calculate t-statistic
    double t_statistic = (mean1 - mean2) / sqrt(pooled_variance);

    return t_statistic;
}

double anova(double **groups, int num_groups, int *group_sizes)
{
    if (num_groups <= 1)
        return NAN; // Check for invalid number of groups

    double grand_mean = 0.0;
    int total_size = 0;

    // Debugging: Log number of groups and group sizes
    printf("Number of groups: %d\n", num_groups);
    for (int i = 0; i < num_groups; i++)
    {
        printf("Group %d size: %d\n", i, group_sizes[i]);
    }

    // Calculate grand mean
    for (int i = 0; i < num_groups; i++)
    {
        if (group_sizes[i] == 0)
        {
            printf("The size 0 issue for group %d\n", i);
            return NAN; // Avoid division by zero for empty groups
        }
        grand_mean += calculate_mean(groups[i], group_sizes[i]) * group_sizes[i];
        total_size += group_sizes[i];
    }
    grand_mean /= total_size;

    // Debugging: Print grand mean
    printf("Grand Mean: %f\n", grand_mean);
    fflush(stdout);

    // Calculate Between-Group and Within-Group Variance
    double ss_between = 0.0, ss_within = 0.0;
    for (int i = 0; i < num_groups; i++)
    {
        double group_mean = calculate_mean(groups[i], group_sizes[i]);
        ss_between += group_sizes[i] * pow(group_mean - grand_mean, 2);

        for (int j = 0; j < group_sizes[i]; j++)
        {
            ss_within += pow(groups[i][j] - group_mean, 2);
        }
    }

    // Debugging: Print sum of squares
    printf("SS Between: %f\n", ss_between);
    printf("SS Within: %f\n", ss_within);
    fflush(stdout);

    // Mean Squares
    double ms_between = ss_between / (num_groups - 1);
    double ms_within = ss_within / (total_size - num_groups);

    // Debugging: Print mean squares
    printf("MS Between: %f\n", ms_between);
    printf("MS Within: %f\n", ms_within);
    fflush(stdout);

    // Calculate F-statistic
    double result = ms_between / ms_within;

    return result; // Return F-statistic
}
