#include <stdio.h>
#include <math.h>
#include <stdlib.h>
#include <time.h>

// Function to calculate mean of an array (already provided)
double calculate_mean(double *data, int size)
{
    clock_t start, end;
    double cpu_time_used;

    // Start the timer
    start = clock();

    double sum = 0.0;
    for (int i = 0; i < size; i++)
    {
        sum += data[i];
    }
    double mean = sum / size;

    // End the timer
    end = clock();
    cpu_time_used = ((double)(end - start)) / CLOCKS_PER_SEC;
    printf("Mean calculation time: %f seconds\n", cpu_time_used);

    return mean;
}

// Function to calculate variance
double calculate_variance(double *data, int size)
{
    clock_t start, end;
    double cpu_time_used;

    // Start the timer
    start = clock();

    double mean = calculate_mean(data, size);
    double sum_of_squares = 0.0;
    for (int i = 0; i < size; i++)
    {
        sum_of_squares += (data[i] - mean) * (data[i] - mean);
    }
    double variance = sum_of_squares / (size - 1); // Sample variance

    // End the timer
    end = clock();
    cpu_time_used = ((double)(end - start)) / CLOCKS_PER_SEC;
    printf("Variance calculation time: %f seconds\n", cpu_time_used);

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
    clock_t start, end;
    double cpu_time_used;

    // Start the timer
    start = clock();

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

    // End the timer
    end = clock();
    cpu_time_used = ((double)(end - start)) / CLOCKS_PER_SEC;
    printf("T-test calculation time: %f seconds\n", cpu_time_used);

    return t_statistic;
}

// Function for performing one-way ANOVA
double anova(double **groups, int num_groups, int *group_sizes)
{
    clock_t start, end;
    double cpu_time_used;

    // Start the timer
    start = clock();

    double grand_mean = 0.0;
    int total_size = 0;

    // Calculate grand mean
    for (int i = 0; i < num_groups; i++)
    {
        grand_mean += calculate_mean(groups[i], group_sizes[i]) * group_sizes[i];
        total_size += group_sizes[i];
    }
    grand_mean /= total_size;

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

    double ms_between = ss_between / (num_groups - 1);        // Mean Square Between
    double ms_within = ss_within / (total_size - num_groups); // Mean Square Within
    double result = ms_between / ms_within;
    // End the timer
    end = clock();
    cpu_time_used = ((double)(end - start)) / CLOCKS_PER_SEC;
    printf("T-test calculation time: %f seconds\n", cpu_time_used);
    
    return result; // F-statistic
}
