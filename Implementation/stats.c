#include <stdio.h>
#include <math.h>

// Function to calculate mean of an array
double calculate_mean(double* data, int size) {
    double sum = 0.0;
    for (int i = 0; i < size; i++) {
        sum += data[i];
    }
    return sum / size;
}

// Function to calculate variance of an array
double calculate_variance(double* data, int size) {
    double mean = calculate_mean(data, size);
    double variance = 0.0;
    for (int i = 0; i < size; i++) {
        variance += pow(data[i] - mean, 2);
    }
    return variance / size;
}
