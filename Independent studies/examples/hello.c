#include <stdio.h>
#include <stdlib.h> // For atoi (converting string to int)

// Set a static buffer for argv simulation
char *argv[3];

int main(int argc, char *argv[])
{
    // Check if exactly two arguments are passed (excluding program name)
    if (argc != 3)
    {
        printf("Usage: %s <num1> <num2>\n", argv[0]);
        return 1; // Return error code
    }

    // Convert the command-line arguments from strings to integers
    int num1 = atoi(argv[1]);
    int num2 = atoi(argv[2]);

    // Print the sum
    printf("The sum of %d and %d is %d\n", num1, num2, num1 + num2);

    return 0; // Return success
}
