#include <iostream>
#include <fstream>

int main()
{
    try // replaced with series of condition checkes
    {
        std::ifstream file("data.txt"); // will be stored in in-memory file system
        if (!file)
            throw std::runtime_error("File not found");
        std::cout << "File opened successfully!" << std::endl; // replaced with console.log()
    }
    catch (const std::exception &e)
    {
        std::cerr << "Error: " << e.what() << std::endl; // replaced with console.log()
    }
    return 0;
}
